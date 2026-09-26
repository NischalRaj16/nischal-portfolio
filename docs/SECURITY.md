# Security

This is a static site: no server code, no database, no logins and no cookies. That removes most attack surface by design. On top of that:

| Measure | Where |
| --- | --- |
| **Content Security Policy** allowing scripts only from this site, fonts only from Google Fonts, and no plugins, forms or `<base>` hijacking | `<meta http-equiv="Content-Security-Policy">` in `index.html` |
| **No third-party JavaScript.** Every script is served from this repository | `assets/js/` |
| **No inline scripts or inline style attributes**, so the CSP needs no `unsafe-inline` for scripts or styles | `index.html` |
| **Referrer policy** `strict-origin-when-cross-origin` | `index.html` |
| **Clickjacking guard.** The site breaks out of any frame that embeds it | `assets/js/verify.js` |
| **HTTPS only.** GitHub Pages forces HTTPS, and the CSP upgrades any stray `http://` request | GitHub Pages + CSP |
| **Safe DOM updates.** Verification results are written with `textContent`, never `innerHTML` | `assets/js/verify.js` |
| **External links** open with `rel="noopener noreferrer"` | `index.html` |
| **Tamper-evident records.** Credentials are hashed and anchored on Bitcoin | [VERIFY.md](VERIFY.md) |
| **Vulnerability contact** | [`.well-known/security.txt`](../.well-known/security.txt) |

GitHub Pages does not allow custom HTTP response headers, so `frame-ancestors`, HSTS preload and `Permissions-Policy` cannot be set here. Serving the same files from Cloudflare Pages or Netlify would allow them through a `_headers` file.

To report a security issue, email **nischals.shiva@gmail.com**.
