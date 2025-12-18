#!/usr/bin/env node
const browserify = require('browserify');
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

const b = browserify('./js/Game.js', { debug: true });

b.bundle((err, buf) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  fs.writeFileSync(path.join(buildDir, 'build.js'), buf);
  console.log('Build complete!');
});
