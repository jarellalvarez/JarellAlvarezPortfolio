# Nginx files for the DigitalOcean droplet

| File | Goes to |
| --- | --- |
| `security-headers.conf` | `/etc/nginx/snippets/portfolio-security-headers.conf` |
| `jarellalvarez.com.conf` | `/etc/nginx/sites-available/jarellalvarez.com` (then link it into `sites-enabled`) |
| `ask-ratelimit.conf` | `/etc/nginx/conf.d/ask-ratelimit.conf` (only when the AI helper is set up) |

Nothing here contains a password or key. The study password is only ever used at build time on your Mac, and the Anthropic key lives in a systemd env file on the server (step 6).
