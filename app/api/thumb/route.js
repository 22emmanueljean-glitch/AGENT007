export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || 'Dominion Engine';
  const color = searchParams.get('color') || '4f8c5e';

  const svg = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#${color}" opacity="0.1"/>
    <text x="50%" y="50%" font-size="90" fill="#111"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Arial,Helvetica,sans-serif">${text}</text>
  </svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  });
}
