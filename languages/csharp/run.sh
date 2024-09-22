#!/bin/bash


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

dotnet $SCRIPT_DIR/UnitOperations.Console/bin/Release/net8.0/UnitOperations.Console.dll $1 $2 $3
