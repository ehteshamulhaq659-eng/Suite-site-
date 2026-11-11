import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Image src="/brand/eh-fabrics-reversed.svg" alt="E&H Fabrics" width={230} height={90} />
          <p>Considered fabrics. Timeless details. Pieces chosen to make every day feel a little more special.</p>
        </div>
        <div className="footer-column"><h3>Explore</h3><Link href="/products">Shop all</Link><Link href="/products?collection=The%20Premium%20Edit">Premium edit</Link><Link href="/request-a-suit">Request a suit</Link></div>
        <div className="footer-column"><h3>Client care</h3><Link href="/account">My account</Link><Link href="/checkout">Shopping bag</Link><Link href="/request-a-suit">Contact support</Link></div>
        <div className="footer-column"><h3>Stay in touch</h3><p>For product questions, special requests and order assistance, our team is here to help.</p><Link className="footer-contact" href="/request-a-suit">Speak with our team ↗</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} E&H Fabrics. All rights reserved.</span><span>Wear elegance · Live in style</span><Link href="/admin">Store administration</Link></div>
    </footer>
  );
}
