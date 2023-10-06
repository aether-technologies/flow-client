#!/bin/bash

mkdir -p dist
rm -rf dist/*

node ./scripts/build.js ./flow ./index.mjs ./dist/flow.bundle.mjs