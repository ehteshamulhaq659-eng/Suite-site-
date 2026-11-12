export function BrandLoader() {
  return (
    <div className="brand-loader" role="status" aria-label="Loading E&H Fabrics">
      <div className="brand-loader-content" aria-hidden="true">
        <div className="brand-loader-monogram"><span>E</span><i>&amp;</i><span>H</span></div>
        <p className="brand-loader-name">E&amp;H FABRICS</p>
        <p className="brand-loader-tagline">A Touch of Timeless Elegance</p>
        <div className="brand-loader-track"><span/></div>
      </div>
      <span className="visually-hidden">Loading E&amp;H Fabrics</span>
    </div>
  );
}
