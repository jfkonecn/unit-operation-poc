#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

gcc $SCRIPT_DIR/main.c -o "$SCRIPT_DIR/main"
