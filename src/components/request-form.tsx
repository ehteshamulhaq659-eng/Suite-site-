"use client";

import { useState, type FormEvent } from "react";

export function RequestForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    const form = new FormData(); form.append("file", file);
    try {
      const response = await fetch("/api/support-uploads", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setImageUrl(result.data.url);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setUploading(false); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setMessage(""); setSuccess(false);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      customerName: String(form.get("customerName") || ""), phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""), preferredColour: String(form.get("preferredColour") || ""),
      fabricPreference: String(form.get("fabricPreference") || ""), budget: form.get("budget") ? Number(form.get("budget")) : undefined,
      description: String(form.get("description") || ""), referenceImageUrl: imageUrl,
    };
    try {
      const response = await fetch("/api/support-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your request could not be submitted.");
      setSuccess(true);
      setMessage(`Your request has been received. Reference: ${result.data.requestNumber}. Our team will contact you.`);
      formElement.reset(); setImageUrl("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Your request could not be submitted."); }
    finally { setSubmitting(false); }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="form-grid"><label>Full name<input name="customerName" required minLength={2} placeholder="Your name" /></label><label>WhatsApp number<input name="phone" required minLength={7} placeholder="03xx xxxxxxx" /></label><label>Email address <span className="optional-label">optional</span><input name="email" type="email" placeholder="you@example.com" /></label><label>Preferred colour<input name="preferredColour" placeholder="e.g. emerald, ivory, maroon" /></label><label>Fabric preference<input name="fabricPreference" placeholder="e.g. lawn, cotton, chiffon" /></label><label>Approximate budget (PKR)<input name="budget" type="number" min="0" placeholder="Your budget" /></label></div>
      <label>Tell us about the suit<textarea name="description" required minLength={10} rows={5} placeholder="Describe the style, embroidery, print, occasion or any details you have in mind..." /></label>
      <div className="upload-panel"><div><b>Have a reference picture?</b><small>Upload a clear photo of the suit you are looking for. JPG, PNG or WebP, up to 6 MB.</small></div><label className="upload-button">{uploading ? "Uploading…" : imageUrl ? "Change picture" : "Upload reference photo"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])}/></label>{imageUrl && <span className="upload-success">Image attached ✓</span>}</div>
      {message && <div className={`form-message ${success ? "success" : "error"}`} role="status">{message}</div>}
      <button className="button button-dark button-full" type="submit" disabled={submitting || uploading}>{submitting ? "Sending request…" : "Send my suit request"}<span>↗</span></button>
      <p className="form-privacy">Your details are used only to respond to this request.</p>
    </form>
  );
}
