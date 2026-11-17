# Hosting on DigitalOcean (plan, not done yet)

Goal: move the portfolio off Vercel/Netlify to the existing droplet, upload with FileZilla, and get working HTTPS.

## At a glance

| Part | How |
|---|---|
| Website | Static files from `site/dist/`, uploaded with FileZilla (SFTP) |
| Web server | Nginx on the droplet |
| HTTPS | Let's Encrypt via `certbot --nginx`, auto-renews |
| Ask Jarell written answers | Work as-is (static `/ask.json`) |
| Ask Jarell AI fallback | Needs a small Node helper on the droplet (see step 6). Until then, the chat should fall back to "Email Jarell", which needs a check. |

## Why HTTPS probably failed before

Usually one of these:
1. The domain's DNS didn't point to the droplet yet when certbot ran.
2. Ports 80/443 were blocked (`ufw` or the DigitalOcean cloud firewall).
3. Nginx `server_name` didn't match the domain, so certbot couldn't find the site.
4. `www` wasn't in DNS but was in the certificate request.

The steps below check each one before asking for a certificate.

## Steps (one at a time, check each before the next)

1. **DNS:** an `A` record for `jarellalvarez.com` and `www` pointing to the droplet IP. Check: `dig +short jarellalvarez.com` shows the droplet IP.
2. **Firewall:** `sudo ufw allow 'Nginx Full'` and allow 80 and 443 in any DigitalOcean cloud firewall.
3. **Nginx site:** root `/var/www/jarellalvarez.com`, `server_name jarellalvarez.com www.jarellalvarez.com;`, and `try_files $uri $uri/ $uri.html =404;`. Check: `sudo nginx -t`.
4. **Build and upload:** run `npm run build` in `site/`, then use FileZilla (SFTP, port 22, SSH key) to upload the **contents** of `site/dist/` into `/var/www/jarellalvarez.com`.
5. **HTTPS:** run `sudo certbot --nginx -d jarellalvarez.com -d www.jarellalvarez.com` and choose redirect. Check that `sudo certbot renew --dry-run` passes.
6. **AI fallback (optional):** run `netlify/functions/ask.mjs` behind a tiny Node server (managed by systemd) on localhost, with Nginx proxying `/.netlify/functions/ask` to it. The `ANTHROPIC_API_KEY` goes in the systemd env file on the server only, never in uploaded files.
7. **Switch over:** once the droplet serves correctly over HTTPS, remove the domain from Vercel/Netlify.

## Open questions

- Does the droplet already host anything on this domain or other sites, so the Nginx config needs to sit alongside them?
- Do we keep the AI fallback, or ship written answers only first?
- The Decap CMS at `/admin` relies on Netlify login, so it stops working off Netlify. Is it still in use?
