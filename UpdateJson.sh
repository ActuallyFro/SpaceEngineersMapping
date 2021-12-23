#!/bin/bash
inputFile="space-engineers.gxl"
outputFile="space-engineers.json"

checkEmpty=`cat -n $inputFile | grep "<data key=\"\">"`

# If empty error
if [[ "$checkEmpty" != "" ]]; then
  echo "[ERROR] There's an empty key! (Look for: '<data key=\"\">')"
  echo ""
  echo "See line:"
  echo $checkEmpty
  exit
fi

python3 RBGT/00_Python_gxl2json/convertD2R-GXL-files.py -i $inputFile -o $outputFile
