#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

gcc -g -o $SCRIPT_DIR/cycles $SCRIPT_DIR/cycles.c
gcc -g -o $SCRIPT_DIR/read-time $SCRIPT_DIR/read-time.c

