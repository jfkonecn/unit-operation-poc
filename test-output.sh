#!/bin/bash

LANGUAGES=("c" "csharp")

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CYCLES="$SCRIPT_DIR/performance-utils/cycles"
READ_TIME="$SCRIPT_DIR/performance-utils/read-time"

TEST_RESULTS="$SCRIPT_DIR/test-results"

files=()

for FILE in $SCRIPT_DIR/data-generation/test-data/*_rows.csv; do
    FILENAME=$(basename "$FILE")
    FILENAME_NO_EXT="${FILENAME%.*}"
    TOTAL_RECORDS=${FILENAME%%_*}
    files+=($FILENAME_NO_EXT)
    echo "Processing $FILENAME"
    for LANGUAGE in "${LANGUAGES[@]}"; do
        echo "Processing language: $LANGUAGE"
        LANGUAGE_DIR="$SCRIPT_DIR/$LANGUAGE"
        RUN_SCRIPT="$LANGUAGE_DIR/run.sh"
        RUN_RESULT_FOLDER="$TEST_RESULTS/$FILENAME_NO_EXT"
        mkdir -p $RUN_RESULT_FOLDER

        echo "Run Number $RUN_NUMBER of $TOTAL_RUNS"
        echo "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES"
        eval "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES" \
            | awk '/DDDDDDDDDDDDDDDDDDD/{flag=!flag;next} flag' \
            | sed "s/^/$RUN_META_DATA/" > "$RUN_RESULT_FOLDER/$LANGUAGE.txt"

        echo "Finished processing language: $LANGUAGE"
        echo "----------------------------------------"
    done
done


for file in "${files[@]}"; do
    echo "file: $file"
done
