#!/bin/bash

cd "`dirname "$0"`"


# Kill existing processes
lsof -t -i tcp:8080 | xargs kill

# Output local IP
localIP=$(ipconfig getifaddr en0)

echo ""
echo "Access on network at: http://${localIP}:8080"

# Run Sass & webpack dev server concurrently

sass --watch scss:bin/css & npm run start:dev

$SHELL
