#!/usr/bin/env bash
# Encode a raw generated clip into the two web versions used by the site.
# Usage: ./scripts/encode-video.sh path/to/raw-clip.mp4
# Author: Nischal Sadashivaiah
set -euo pipefail
IN="${1:?give the raw clip path}"
OUT="$(dirname "$0")/../video"
mkdir -p "$OUT"
FILTER="scale=1920:1080:flags=lanczos,unsharp=5:5:0.7:5:5:0.0,hqdn3d=1:1:2:2"

# H.264 MP4, every frame a keyframe so scrubbing (seeking) is instant
ffmpeg -y -i "$IN" -an -vf "$FILTER" \
  -g 1 -keyint_min 1 -c:v libx264 -crf 23 -preset slow -tune film \
  -profile:v high -pix_fmt yuv420p -movflags +faststart \
  "$OUT/portfolio-background.mp4"

# VP9 WebM fallback for browsers without H.264
ffmpeg -y -i "$IN" -an -vf "$FILTER" \
  -c:v libvpx-vp9 -g 8 -b:v 0 -crf 31 -deadline good -cpu-used 3 -row-mt 1 \
  "$OUT/portfolio-background.webm"

ls -lh "$OUT"
