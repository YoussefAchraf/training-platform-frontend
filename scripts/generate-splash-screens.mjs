





import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'splash');
mkdirSync(outDir, { recursive: true });

const iconSvg = readFileSync(path.join(root, 'public', 'favicon.svg'), 'utf-8');
const BACKGROUND = '#fafafa'; 



const DEVICES = [
  { name: 'iphone-se', width: 375, height: 667, dpr: 2 },
  { name: 'iphone-standard', width: 390, height: 844, dpr: 3 },
  { name: 'iphone-plus', width: 430, height: 932, dpr: 3 },
  { name: 'ipad-10-9', width: 820, height: 1180, dpr: 2 },
  { name: 'ipad-pro-12-9', width: 1024, height: 1366, dpr: 2 },
];

function splashSvg(pxWidth, pxHeight) {
  const iconSize = Math.round(Math.min(pxWidth, pxHeight) * 0.24);
  const x = Math.round((pxWidth - iconSize) / 2);
  const y = Math.round((pxHeight - iconSize) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxWidth}" height="${pxHeight}" viewBox="0 0 ${pxWidth} ${pxHeight}">
    <rect width="${pxWidth}" height="${pxHeight}" fill="${BACKGROUND}"/>
    <g transform="translate(${x} ${y})">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 512 512">${iconSvg.replace(/<\/?svg[^>]*>/g, '')}</svg>
    </g>
  </svg>`;
}

const links = [];

for (const device of DEVICES) {
  const pxWidth = device.width * device.dpr;
  const pxHeight = device.height * device.dpr;
  const svg = splashSvg(pxWidth, pxHeight);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: pxWidth } });
  const png = resvg.render().asPng();
  const filename = `${device.name}.png`;
  writeFileSync(path.join(outDir, filename), png);
  console.log('wrote', filename, `${pxWidth}x${pxHeight}`);

  links.push(
    `<link rel="apple-touch-startup-image" href="/splash/${filename}" media="(device-width: ${device.width}px) and (device-height: ${device.height}px) and (-webkit-device-pixel-ratio: ${device.dpr}) and (orientation: portrait)" />`,
  );
}

console.log('\nAdd these to index.html <head> if the device list above changed:\n');
console.log(links.join('\n'));
