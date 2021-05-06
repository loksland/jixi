#!/bin/bash

cd "`dirname "$0"`"
cd "app"

#npm run dev
#npm run build

lsof -t -i tcp:8080 | xargs kill


localIP=$(ipconfig getifaddr en0)
echo "Access on network at: http://${localIP}:8080"

npm run start:dev

$SHELL
