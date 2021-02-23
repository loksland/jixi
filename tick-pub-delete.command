#!/bin/bash
cd "`dirname "$0"`"

CHANGELOG_DOC_PATH="./CHANGELOG.md"

# Bash colours
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;93m'
NC='\033[0m' # No Color


# Extract the previous version
VERSION_PREV=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')
VERSION_PREV="$(echo -e "${VERSION_PREV}" | tr -d '[:space:]')" # Strip whitespace

# Tick the package version 
VERSION_NEXT=$(npm version patch --no-git-tag-version)

#VERSION_NEXT=$(echo $VERSION_NEXT | cut -c 2-)


$SHELL

