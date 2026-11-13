import { testimonials } from '../lib/content.mjs';
// The Kind words window loads this. Only quotes not already shown on another page.
export const GET = () => new Response(JSON.stringify(testimonials().filter(p => p.place === 'window')), { headers: { 'Content-Type': 'application/json' } });
