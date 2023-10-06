New-Item -ItemType Directory -Force -Path "dist"
Remove-Item -Recurse -Force "dist\*"

node ./scripts/build.js ./flow ./index.mjs ./dist/flow.bundle.mjs