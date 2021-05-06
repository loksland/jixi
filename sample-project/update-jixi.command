#!/bin/bash

cd "`dirname "$0"`"
cd "app"

#npm run dev
#npm run build

npm update jixi --save

echo ""
echo "jixi version:"
npm view jixi version
echo ""

$SHELL
