import type { Metadata } from "next";
import Image from "next/image";
import { RequestForm } from "@/components/request-form";
export const metadata: Metadata = { title: "Request a suit" };
export default function RequestASuitPage() {
  return <main className="subpage-shell request-page"><div className="breadcrumbs"><a href="/">Home</a><span>/</span><span>Personal request</span></div><div className="request-page-grid"><div className="request-intro"><div className="eyebrow"><span/> A PERSONAL E&H SERVICE</div><h1>Tell us what<br/><em>you’re looking for.</em></h1><p>Have a suit in mind that you can’t find in our collection? Share a photograph or describe the design. Our team will review your request and get back to you.</p><div className="request-image"><Image src="/products/suit-04.webp" alt="Detailed ladies suit fabric and embroidery" fill sizes="(max-width: 800px) 100vw, 42vw"/></div><div className="request-promise"><span>✳</span><div><b>A real person, ready to help.</b><small>We’ll review your reference and contact you on WhatsApp to discuss suitable options.</small></div></div></div><div className="request-form-wrap"><div className="request-form-heading"><span>01 — YOUR DETAILS</span><h2>Make a request</h2><p>Fields marked with * are required.</p></div><RequestForm/></div></div></main>;
}
