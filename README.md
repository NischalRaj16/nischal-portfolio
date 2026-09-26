# Nischal Sadashivaiah — Portfolio

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
- Custom cursor with magnetic buttons, Lenis smooth scrolling
- Respects `prefers-reduced-motion`; works on phones

## Structure

```
index.html              page markup
assets/css/style.css    styles and design tokens
assets/js/main.js       scrub engine and all interactions
video/                  background clip (MP4 + WebM fallback)
scripts/encode-video.sh re-encodes a raw clip for smooth scrubbing
docs/HOW-I-MADE-THE-VIDEO.md
```

## Run locally

The video needs to be served over HTTP (not opened as a file) so the browser can seek inside it:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown).

## Deploy

It is a static site, so it runs on GitHub Pages, Netlify or Vercel with no build step. For GitHub Pages: push to a repository, then *Settings → Pages → Deploy from branch → main / root*.

## Customising

- Content lives in `index.html`; the credential cards are in the `CREDS` array in `main.js`.
- Colours and fonts are CSS variables at the top of `style.css`.
- To use a new clip, run `./scripts/encode-video.sh your-clip.mp4`.

## Tech

HTML, CSS and vanilla JavaScript. Fonts from Google Fonts (Oswald, Syne, Space Grotesk, JetBrains Mono). Smooth scrolling by [Lenis](https://github.com/darkroomengineering/lenis) (MIT). Video encoded with FFmpeg.

## Built with AI assistance

Designed and directed by Nischal Sadashivaiah. As part of this project I used generative AI tools as collaborators: an image model and an image-to-video model for the background clip, and an AI coding assistant for the site code.

## License

MIT © 2026 Nischal Sadashivaiah
