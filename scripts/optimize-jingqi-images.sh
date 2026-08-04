#!/bin/sh

set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
image_dir="$project_dir/assets/reports/jingqi"
work_dir=$(mktemp -d)

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT INT TERM

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required to optimize the JingQi images." >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  image_names="$*"
else
  image_names="attendees.jpg competition.jpg panel.jpg sharing.jpg"
fi

for image_name in $image_names; do
  source_path="$image_dir/$image_name"
  output_path="$work_dir/$image_name"
  max_dimension=1280
  jpeg_quality=68

  if [ "$image_name" = "competition.jpg" ]; then
    max_dimension=960
    jpeg_quality=50
  fi

  if [ ! -f "$source_path" ]; then
    echo "Missing image: $source_path" >&2
    exit 1
  fi

  sips \
    --resampleHeightWidthMax "$max_dimension" \
    --setProperty format jpeg \
    --setProperty formatOptions "$jpeg_quality" \
    "$source_path" \
    --out "$output_path" \
    >/dev/null

  mv "$output_path" "$source_path"
done

echo "Optimized JingQi images in $image_dir"
