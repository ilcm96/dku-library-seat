rm -r dist/*
cp favicon.ico dist/
cp apple-touch-icon.png dist/
cp index.* dist/
cp -r functions/ dist/
wrangler pages deploy dist/
