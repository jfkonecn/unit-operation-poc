#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CYCLES="$SCRIPT_DIR/performance-utils/cycles"

LANGUAGE="csharp"
TEST_FILE_NAME="$(echo $ROW_COUNT)_rows.csv"
ROW_COUNT=1


LANGUAGES=("csharp")

for LANGUAGE in "${LANGUAGES[@]}"; do
    echo "Processing language: $LANGUAGE"
    for FILE in $SCRIPT_DIR/data-generation/test-data/*_rows.csv; do
        FILENAME=$(basename "$FILE")
        TOTAL_RECORDS=${FILENAME%%_*}

        echo "Processing $FILENAME"

        LANGUAGE_DIR="$SCRIPT_DIR/$LANGUAGE"
        RUN_SCRIPT="$LANGUAGE_DIR/run.sh"
        eval "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES" \
            | sed '/DDDDDDDDDDDDDDDDDDD/,/DDDDDDDDDDDDDDDDDDD/d' \
            | awk '/XXXXXXXXXXXXXXXXXXXX/{f=1; next} !f{print > "before.txt"} f{print > "after.txt"}'

    done
    echo "Finished processing language: $LANGUAGE"
    echo "----------------------------------------"
done
