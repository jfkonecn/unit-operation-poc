#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CYCLES="$SCRIPT_DIR/performance-utils/cycles"
READ_TIME="$SCRIPT_DIR/performance-utils/read-time"

TEST_RESULTS="$SCRIPT_DIR/test-results"

for LANGUAGE_DIR in "$SCRIPT_DIR/languages"/*/; do
    LANGUAGE=$(basename "$LANGUAGE_DIR")
    echo "Building language: $LANGUAGE"
    eval "$LANGUAGE_DIR/build.sh"
done

for FILE in $SCRIPT_DIR/data-generation/test-data/*_rows.csv; do
    FILENAME=$(basename "$FILE")
    FILENAME_NO_EXT="${FILENAME%.*}"
    TOTAL_RECORDS=${FILENAME%%_*}
    folders+=($FILENAME_NO_EXT)
    echo "Processing $FILENAME"
    for LANGUAGE_DIR in "$SCRIPT_DIR/languages"/*/; do
        LANGUAGE=$(basename "$LANGUAGE_DIR")
        echo "Processing language: $LANGUAGE"
        RUN_SCRIPT="$LANGUAGE_DIR/run.sh"
        RUN_RESULT_FOLDER="$TEST_RESULTS/$FILENAME_NO_EXT"
        mkdir -p $RUN_RESULT_FOLDER

        eval "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES" \
            | awk '/DDDDDDDDDDDDDDDDDDD/{flag=!flag;next} flag' \
            | sed "s/^/$RUN_META_DATA/" > "$RUN_RESULT_FOLDER/$LANGUAGE.txt"

        echo "Finished processing language: $LANGUAGE"
        echo "----------------------------------------"
    done
done

all_identical=true
for folders in "${folders[@]}"; do
    RUN_RESULT_FOLDER="$TEST_RESULTS/$folders"
    checksum=$(md5sum $RUN_RESULT_FOLDER/*.txt | head -n 1 | awk '{ print $1 }')
    for file in $RUN_RESULT_FOLDER/*.txt; do
        current_checksum=$(md5sum "$file" | awk '{ print $1 }')
        if [[ $current_checksum != $checksum ]]; then
            all_identical=false
            echo "$file differs."
            break
        fi
    done
done

if $all_identical; then
    echo "All files are identical."
    exit 0
else
    echo "Not all files are identical."
    exit 1
fi
