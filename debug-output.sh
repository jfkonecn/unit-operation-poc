#!/bin/bash

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <language> <total_records>"
    exit 1
fi

LANGUAGE=$1
TOTAL_RECORDS=$2

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CYCLES="$SCRIPT_DIR/performance-utils/cycles"
FILE="$SCRIPT_DIR/data-generation/test-data/"$TOTAL_RECORDS"_rows.csv"

LANGUAGE_DIR="$SCRIPT_DIR/languages/$LANGUAGE"
RUN_SCRIPT="$LANGUAGE_DIR/run.sh"

eval "$LANGUAGE_DIR/build.sh"
eval "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES"
