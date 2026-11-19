# Moving from Netlify to DigitalOcean

Rule for the whole plan: the Netlify site stays live and unchanged until the DigitalOcean copy is checked and working. Nothing below touches DNS, spends money or creates an account until you do that step yourself with me, one step at a time.

## 1. What the site gets from Netlify today

| Netlify does this | Where it is set | What replaces it on DigitalOcean |
| --- | --- | --- |
| Builds the site on every push to `master` (`npm run build` in `site/`, publish `dist`, Node 22) | root `netlify.toml` `[build]` | You build on your Mac (or a GitHub Action later) and upload `site/dist/` |
| Study password for the locked case studies | Netlify env `STUDY_PASSWORD` | Same value in a local `site/.env` on the build machine only. A production build stops if it is missing |
| Security headers on every page (X-Frame-Options, nosniff, referrer policy, permissions policy) and `noindex` for `/admin/*` | `netlify.toml` `[[headers]]` | `deploy/nginx/security-headers.conf` |
| Hosting, global CDN, caching | Netlify | Nginx caching rules in `deploy/nginx/jarellalvarez.com.conf` (one droplet, no CDN) |
| HTTPS certificate and renewal | Netlify | Let's Encrypt with `certbot` (auto-renews) |
| Clean URLs (`/about/`) and the 404 page | Netlify | Nginx `try_files` and `error_page 404 /404.html` (already in the template) |
| The "Ask Jarell" AI answers | Function `site/netlify/functions/ask.mjs`, env `ANTHROPIC_API_KEY` | A small Node helper on the droplet (optional), key in a server-only file |
| The `/admin` editor (Decap CMS) | `site/public/admin/config.yml`, GitHub login through `api.netlify.com` | Stops working. Edit through Claude and GitHub instead, or add our own login later |
| Domain and DNS | DNS is at Namecheap, pointing at Netlify | Change the Namecheap records at the end |

Not used: Netlify Forms, redirects, Netlify Identity, Large Media.

## 2. Recommendation: one Droplet with Nginx (not App Platform)

| | Droplet + Nginx (recommended) | App Platform static site |
| --- | --- | --- |
| Cost | You already have the droplet, no new cost | New app, small monthly fee for anything beyond the free static tier |
| The Ask Jarell AI helper | Runs next to the site | Needs a second "service" component and its own billing |
| Control over headers and caching | Full (our templates are ready) | Limited, set in app config |
| Maintenance | You apply server updates (about 10 minutes a month) | DigitalOcean does it |
| Risk | Server mistakes can take the site down, so we test first | Lower |

I recommend the droplet because it exists, it is cheapest, and it handles the AI helper. If you would rather never touch a server, App Platform is a fine fallback for the static site only (the AI helper would then be dropped or moved).

## 3. Steps (one action each; do not skip the check)

Every step says how to check it worked. Rollback for the whole plan is at the end.

1. **Write down the current state.** Note the Netlify site URL and your Namecheap DNS records (screenshot). Check: you have both saved.
2. **Back up the old portfolio on the droplet.** In FileZilla, connect to the droplet and download its whole web folder to your Mac. Check: the folder on your Mac opens and has `index.html`.
3. **Look around the droplet (read-only).** I give you three commands (`nginx -v`, `ls /etc/nginx/sites-enabled`, `sudo ss -tlnp`). Check: you paste the output and we agree what is already there.
4. **Create the new web folder** `/var/www/jarellalvarez.com` next to the old one. Check: `ls -ld /var/www/jarellalvarez.com`.
5. **Add the Nginx files** from `deploy/nginx/` (headers snippet, site file; the AI rate-limit file later). Check: `sudo nginx -t` says "syntax is ok".
6. **Open the firewall** for 80 and 443 (`ufw` and any DigitalOcean cloud firewall). Check: `sudo ufw status` lists Nginx Full.
7. **Build on your Mac** with the real study password in `site/.env`. Check: `npm run build` finishes, and `node scripts/check-links.mjs` reports 0 broken.
8. **Upload `site/dist/`** (the contents) to `/var/www/jarellalvarez.com` with FileZilla. Check: `/var/www/jarellalvarez.com/index.html` exists.
9. **Test before any DNS change:** `curl --resolve jarellalvarez.com:80:DROPLET_IP http://jarellalvarez.com/about/ -I` shows 200 and the security headers. Open the site from your Mac with a temporary hosts-file line if you want to click through. Check: home, About, a case study (wrong password stays locked, right one opens), the resume PDF and a lightbox image all work.
10. **Lower the DNS time-to-live** on the `@` and `www` records at Namecheap to 5 minutes, and wait the old TTL (usually 30 minutes to a few hours). Check: Namecheap shows the new TTL.
11. **Switch DNS:** point `@` and `www` at the droplet IP. Keep the two `photography` records and the wildcard `*` CNAME exactly as they are. Check: `dig +short jarellalvarez.com` shows the droplet IP.
12. **Turn on HTTPS:** `sudo certbot --nginx -d jarellalvarez.com -d www.jarellalvarez.com`, choose the redirect. Check: the site opens with the lock icon and `sudo certbot renew --dry-run` passes.
13. **AI helper (optional):** install Node, copy `site/netlify/functions/ask.mjs` and the generated `site/netlify/kb.mjs`, run it under systemd on localhost, proxy `/.netlify/functions/ask` to it, add `ask-ratelimit.conf`, put `ANTHROPIC_API_KEY` in a root-only env file. Check: a question not in the written answers gets an "AI answer" label, and the same question from a second tab still works. If this step is skipped, the chat falls back to "Email Jarell".
14. **Watch for a week.** Check the site from a phone on mobile data, the HTTPS grade, and that the Netlify site is no longer receiving visits.
15. **Retire Netlify.** Remove the domain from the Netlify site, then pause or delete the site. Check: the domain still loads from the droplet.

## 4. Rollback

- Before step 11: nothing public changed. Delete the new folder if you like.
- After step 11, if anything is wrong: in Namecheap set `@` and `www` back to the values you saved in step 1. With the 5-minute TTL it is back within minutes, because the Netlify site is still live.
- The old portfolio backup from step 2 is the third safety net.
- Do not do step 15 until step 14 has passed.

## 5. Things to decide before step 1
- Keep the AI helper on the droplet (default) or ship written answers only first.
- Drop `/admin` for now (default).
- Later option: a GitHub Action that builds and uploads on every push to `master`, so you never use FileZilla again.
