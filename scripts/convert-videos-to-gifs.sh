#!/bin/bash
set -e
set -x

for input in /app/doc/*.mp4; do
    output="$(dirname $input)/$(basename $input .mp4).gif"
    convert -quiet -delay 4 $input $output
done
