#!/usr/bin/env bash
# Bump every cache-busting version in one move.
#
# ES modules do NOT inherit the query string of the script that imports
# them: index.html can ask for zen.js?v=9 and still be handed a cached
# garden.js from last week. Every version here has to move together, so
# it is one command rather than three places to forget.
set -euo pipefail
cd "$(dirname "$0")"

cur=$(grep -o 'zen\.css?v=[0-9]*' index.html | head -1 | grep -o '[0-9]*$')
next=$(( cur + 1 ))

sed -i "s|zen\.css?v=[0-9]*|zen.css?v=$next|"        index.html
sed -i "s|zen\.js?v=[0-9]*|zen.js?v=$next|"          index.html
sed -i "s|'\./audio\.js?v=[0-9]*'|'./audio.js?v=$next'|"   assets/js/zen.js
sed -i "s|'\./garden\.js?v=[0-9]*'|'./garden.js?v=$next'|" assets/js/zen.js
sed -i "s|'\./cosmos\.js?v=[0-9]*'|'./cosmos.js?v=$next'|" assets/js/zen.js

echo "v$cur -> v$next"
grep -o '\(zen\.css\|zen\.js\)?v=[0-9]*' index.html
grep -o "\./\(audio\|garden\|cosmos\)\.js?v=[0-9]*" assets/js/zen.js
