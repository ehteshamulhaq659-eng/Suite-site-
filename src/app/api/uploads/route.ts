import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";
const MAX_BYTES = 6 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const access = await requirePermission("products:write");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG or WebP image." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be 6 MB or smaller." }, { status: 413 });
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    if (process.env.DATA_MODE === "neon") {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return NextResponse.json({ error: "Configure Cloudinary credentials for permanent image uploads before enabling Neon mode." }, { status: 503 });
      }
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
      const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder: "eh-fabrics/products", resource_type: "image" });
      return NextResponse.json({ data: { url: result.secure_url, publicId: result.public_id } }, { status: 201 });
    }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer, { flag: "wx" });
    return NextResponse.json({ data: { url: `/uploads/${filename}` } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/uploads", error);
    return NextResponse.json({ error: "The image could not be uploaded." }, { status: 500 });
  }
}
