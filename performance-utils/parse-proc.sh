#!/bin/bash

while IFS= read -r line; do
    case "$line" in
        VmPeak*) VmPeak=$(echo "$line" | awk '{print $2}');;
    esac
done < /dev/stdin

echo "$VmPeak"
