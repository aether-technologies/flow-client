#!/bin/bash

mkdir -p dist
rm -rf dist/*

node ./scripts/build.js ./flow . ./dist/flow.bundle.mjs
