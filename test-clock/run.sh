#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

gcc -g -o $SCRIPT_DIR/main $SCRIPT_DIR/main.c

gdb $SCRIPT_DIR/main

