export function formatPrice(n, listingType) {
  let text;
  if (n >= 10000000) text = `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  else if (n >= 100000) text = `₹${(n / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  else text = `₹${n.toLocaleString('en-IN')}`;
  return listingType === 'rent' ? `${text} / month` : text;
}

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#dfe8e6"/><path d="M250 320V230l150-90 150 90v90z" fill="none" stroke="#7d9993" stroke-width="10"/></svg>`
  );
