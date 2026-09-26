# How I made the background video

The hero background is a 10-second clip that the page scrubs with the cursor and the scroll position, so it behaves like an interactive 3D model without any 3D rendering. It was made in three stages.

## 1. Cinematic still

I generated a single 16:9 portrait of myself in a black suit and aviator sunglasses, lit with red rim light against a black and deep-crimson studio background with light red smoke. I gave the image model two inputs: a composition reference for the pose and framing, and a clear photo of my face so my identity stayed the same.

Prompt I used:

> Use the first image as the composition reference and the second image as the face reference. Create a photorealistic, full-body editorial portrait of the man from the second image in a fitted black suit, white shirt and aviator sunglasses, standing confidently facing the camera. Dark black and deep-red studio background, strong red rim light on the hair and shoulders, subtle red smoke, deep shadows, high contrast. Keep his face and identity exactly as in the photo; do not beautify or change features. 16:9, ultra-detailed, premium cinematic grading.

## 2. Image to video

I turned that still into a 10-second video with an image-to-video model, using a shot list so the motion would read well when scrubbed:

| Time | Action |
| --- | --- |
| 0–2 s | Standing, facing camera, slow push-in |
| 2–4 s | Turns head and shoulders to the left |
| 4–6 s | Turns back to camera as the push continues |
| 6–8 s | Close-up on face and upper body |
| 8–10 s | Raises a hand to adjust the sunglasses and holds the pose |

Prompt notes: plain dark background only, no text or graphics, keep the exact face from the image, smooth cinematic motion.

## 3. Encoding for scrubbing

Browsers can only jump quickly to keyframes, so the clip is re-encoded with **every frame as a keyframe** and upscaled to 1080p with light sharpening:

```bash
./scripts/encode-video.sh raw-clip.mp4
```

This writes `video/portfolio-background.mp4` (H.264) and `video/portfolio-background.webm` (VP9 fallback).

## 4. The scrub engine

`assets/js/main.js` maps the cursor's horizontal position and the page's scroll progress to a target time in the clip, then eases towards it every animation frame:

```js
target  = clamp(scrollProgress * 0.72 + cursorX * 0.28, 0, 1) * duration;
current += (target - current) * 0.10;          // smooth LERP
if (Math.abs(current - last) > 0.001) video.currentTime = current;
```

On top of that, the video layer tilts slightly with the cursor (parallax), and CSS overlays add a vignette, a cursor-following red glow, film grain and faint scanlines. If the video cannot play, the page falls back to a procedural 3D network sphere drawn on a canvas with the same timeline.
