#!/usr/bin/env bash
set -euo pipefail

SRC="assets/images"
OUT="assets/images_webp"

# 3:4 padrão (igual seu preview)
W=1080
H=1440

# Qualidade (70~85 costuma ficar ótimo)
Q=82

mkdir -p "$OUT"

# converte jpg/jpeg/png -> webp
shopt -s nullglob
for f in "$SRC"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  name="$(basename "$f")"
  base="${name%.*}"

  # crop central mantendo 3:4 (sem distorcer)
  magick "$f" \
    -auto-orient \
    -resize "${W}x${H}^" \
    -gravity center \
    -extent "${W}x${H}" \
    -strip \
    -define webp:method=6 \
    -quality "$Q" \
    "$OUT/${base}.webp"
done

echo "OK: gerado em $OUT"
du -sh "$SRC" "$OUT" || true
