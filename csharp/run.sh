#!/bin/bash


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"


$SCRIPT_DIR/UnitOperations.Console/bin/Release/net8.0/UnitOperations.Console $1 $2 $3
