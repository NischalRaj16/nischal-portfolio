# Nischal Sadashivaiah — Portfolio

**Live:** https://nischalraj16.github.io/nischal-portfolio/

Personal portfolio of **Nischal Sadashivaiah**, M.S. student in Artificial Intelligence at Chang Gung University, Taiwan, working on trustworthy AI for edge and IoT security.

The signature feature is a **cursor- and scroll-controlled cinematic video background**: a 10-second clip is scrubbed frame by frame as you move the mouse and scroll, so it feels like an interactive 3D model.

## Features

- Video scrub engine with LERP smoothing, 3D parallax tilt and cursor-following light
- Cinematic overlays: vignette, glow, film grain, scanlines, scroll progress bar
- Floating glass navbar with an active-section pill and a mobile drawer
- Terminal-style About section and skills matrix
- 3D tilt project cards with a cursor spotlight
- Draggable 3D credential ring with throw inertia, auto-spin and detail modal
- Two-sided experience and education timeline with filters
- Contact form that prepares an email, plus copy-to-clipboard
- Custom cursor with magnetic buttons, smooth in-page scrolling
- **On-chain verification:** every credential is hashed (SHA-256), combined into a Merkle tree and the root is timestamped on Bitcoin with OpenTimestamps; visitors' browsers re-check it live ([docs/VERIFY.md](docs/VERIFY.md))
- **Hardened:** strict Content Security Policy, no third-party scripts, no inline code, clickjacking guard, `security.txt` ([docs/SECURITY.md](docs/SECURITY.md))
- SEO and sharing: canonical URL, Open Graph, JSON-LD profile, sitemap, robots.txt, custom 404
- Respects `prefers-reduced-motion`; works on phones; skip-to-content link

## Structure

```
index.html              page markup
assets/css/style.css    styles and design tokens
assets/js/main.js       scrub engine and all interactions
assets/js/verify.js     in-browser credential verification
credentials.json        hashed credential records + Merkle root
proofs/                 Merkle root + OpenTimestamps (Bitcoin) proof
video/                  background clip (MP4 + WebM fallback)
scripts/encode-video.sh re-encodes a raw clip for smooth scrubbing
docs/                   how the video, verification and security work
```

## Run locally

The video needs a server that supports byte-range requests so the browser can seek inside it:

```bash
npx serve .
```

Then open the address it prints.

## Deploy

It is a static site, so it runs on GitHub Pages, Netlify or Vercel with no build step. For GitHub Pages: push to a repository, then *Settings → Pages → Deploy from branch → main / root*.

## Customising

- Content lives in `index.html`; the credential cards are in the `CREDS` array in `main.js`.
- Colours and fonts are CSS variables at the top of `style.css`.
- To use a new clip, run `./scripts/encode-video.sh your-clip.mp4`.
- After editing `credentials.json`, recompute the hashes and re-stamp the root (see [docs/VERIFY.md](docs/VERIFY.md)).

## Tech

HTML, CSS and vanilla JavaScript. Fonts from Google Fonts (Oswald, Syne, Space Grotesk, JetBrains Mono). Video encoded with FFmpeg. Timestamps by [OpenTimestamps](https://opentimestamps.org).

## Built with AI assistance

Designed and directed by Nischal Sadashivaiah. As part of this project I used generative AI tools as collaborators: an image model and an image-to-video model for the background clip, and an AI coding assistant for the site code.

## License

MIT © 2026 Nischal Sadashivaiah
