#!/usr/bin/env bash
# Pipeline complet côté sandbox : captures → montage → encodage.
# usage: bash make_video.sh <workdir>   (le site doit être servi sur http://127.0.0.1:8765/)
set -euo pipefail
WD=${1:-out}; mkdir -p "$WD"
cd "$(dirname "$0")"
URL="http://127.0.0.1:8765/index.html"
node capture.mjs "$URL?capture=1&iv=2.2&speed=1.15" "$WD/full" 15 30 1600 900
for s in 1 2 3 4 5; do node capture.mjs "$URL?capture=1&step=$s&iv=1.5" "$WD/s$s" 3 30 1600 900; done
python3 compose.py "$WD/video/mockup.png" "$WD/full" "$WD" "$WD/vframes" 30
ffmpeg -y -loglevel error -framerate 30 -i "$WD/vframes/v_%05d.jpg" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart "$WD/seve-reel.mp4"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$WD/seve-reel.mp4"
echo VIDEO_DONE
