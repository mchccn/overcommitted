git add .
git commit --allow-empty -m "."
tsc index.ts -t ES2020 -m COMMONJS
node index.js