import { readFileSync } from 'node:fs';
// "Ask Jarell" answers, written by Jarell and edited in /admin. Later, the approved source for an AI fallback.
export const GET = () => new Response(readFileSync(new URL('../../../content/ask.json', import.meta.url), 'utf8'), { headers: { 'Content-Type': 'application/json' } });
