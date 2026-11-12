import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  const storeEmail = process.env.NEXT_PUBLIC_STORE_EMAIL ?? "";

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Image src="/brand/eh-fabrics-reversed.svg" alt="E&H Fabrics" width={230} height={90} />
          <p>Considered fabrics. Timeless details. Pieces chosen to make every day feel a little more special.</p>
        </div>
        <div className="footer-column"><h3>Explore</h3><Link href="/products">Shop all suits</Link><Link href="/products?price=2800">Rs. 2,800 collection</Link><Link href="/products?price=3000">Rs. 3,000 collection</Link><Link href="/products?price=3500">Rs. 3,500 collection</Link><Link href="/products?price=4500">Rs. 4,500 collection</Link></div>
        <div className="footer-column"><h3>Client care</h3><Link href="/account">My account</Link><Link href="/checkout">Shopping bag</Link><Link href="/request-a-suit">Contact support</Link></div>
        <div className="footer-column"><h3>Stay in touch</h3><p>For product questions, special requests and order assistance, our team is here to help.</p>{whatsappNumber ? <a className="footer-contact" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp E&H ↗</a> : <Link className="footer-contact" href="/request-a-suit">Contact our team ↗</Link>}{storeEmail && <a href={`mailto:${storeEmail}`}>{storeEmail}</a>}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} E&H Fabrics. All rights reserved.</span><span>Wear elegance · Live in style</span><Link href="/admin">Store administration</Link></div>
    </footer>
  );
}
