import Link from "next/link";
export default function NotFound() { return <main className="subpage-shell empty-cart"><div className="eyebrow"><span/> NOT FOUND</div><h1>This page took<br/><em>a different turn.</em></h1><p>The page may have moved or the product is no longer available.</p><Link href="/products" className="button button-dark">Return to the collection ↗</Link></main>; }
