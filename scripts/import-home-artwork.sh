#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <source-directory>" >&2
  exit 1
fi

source_dir=$1
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
project_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
output_dir="$project_dir/assets/editorial"
work_dir=$(mktemp -d)

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT INT TERM

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required to import the homepage artwork." >&2
  exit 1
fi

mkdir -p "$output_dir"

import_image() {
  source_name=$1
  output_name=$2
  source_path="$source_dir/$source_name"
  output_path="$output_dir/$output_name"
  temporary_path="$work_dir/$output_name"

  if [ ! -f "$source_path" ]; then
    echo "Missing image: $source_path" >&2
    exit 1
  fi

  pixel_width=$(sips --getProperty pixelWidth "$source_path" | awk '/pixelWidth:/ { print $2 }')
  pixel_height=$(sips --getProperty pixelHeight "$source_path" | awk '/pixelHeight:/ { print $2 }')

  if [ "$pixel_width" -gt 1280 ] || [ "$pixel_height" -gt 1280 ]; then
    sips \
      --resampleHeightWidthMax 1280 \
      --setProperty format jpeg \
      --setProperty formatOptions 68 \
      "$source_path" \
      --out "$temporary_path" \
      >/dev/null
  else
    sips \
      --setProperty format jpeg \
      --setProperty formatOptions 68 \
      "$source_path" \
      --out "$temporary_path" \
      >/dev/null
  fi

  mv "$temporary_path" "$output_path"
}

import_image "IMG_5559.JPG" "boundary.jpg"
import_image "IMG_5560.JPG" "focus.jpg"
import_image "IMG_5689.JPG" "resolve.jpg"
import_image "IMG_5580.JPG" "endurance.jpg"
import_image "IMG_5883.JPG" "near-miss.jpg"
import_image "IMG_6053.JPG" "challenger.jpg"
import_image "IMG_5996.JPG" "judgment.jpg"
import_image "IMG_6114.PNG" "insight.jpg"

echo "Imported optimized homepage artwork into $output_dir"
