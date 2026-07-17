import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

// Génère l'écran de lancement (splash) Pianote : fond sombre + icône + nom.
// Sortie -> resources/splash.png (+ splash-dark.png) pour `npx @capacitor/assets`.
const BASE = 'http://localhost:4599/index.html';

const draw = async (S) => {
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d');
  x.fillStyle = '#0f1117'; x.fillRect(0, 0, S, S);
  const rg = x.createRadialGradient(S/2, S*0.42, 0, S/2, S*0.42, S*0.55);
  rg.addColorStop(0, 'rgba(245,180,85,0.10)'); rg.addColorStop(1, 'rgba(245,180,85,0)');
  x.fillStyle = rg; x.fillRect(0, 0, S, S);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'icons/icon-1024.png'; });
  const size = S * 0.28, ix = (S - size) / 2, iy = S * 0.42 - size / 2, r = size * 0.22;
  x.save();
  x.beginPath();
  x.moveTo(ix+r, iy); x.arcTo(ix+size, iy, ix+size, iy+r, r); x.arcTo(ix+size, iy+size, ix+size-r, iy+size, r);
  x.arcTo(ix, iy+size, ix, iy+size-r, r); x.arcTo(ix, iy, ix+r, iy, r); x.closePath();
  x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = S*0.03; x.shadowOffsetY = S*0.011; x.fill();
  x.clip();
  x.drawImage(img, ix, iy, size, size);
  x.restore();
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `700 ${Math.round(S*0.062)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
  x.fillText('Pianote', S/2, iy + size + S*0.08);
  x.fillStyle = 'rgba(232,234,240,0.6)';
  x.font = `500 ${Math.round(S*0.027)}px -apple-system, "Segoe UI", Roboto, sans-serif`;
  x.fillText('Apprendre le piano', S/2, iy + size + S*0.125);
  return c.toDataURL('image/png').split(',')[1];
};

mkdirSync('resources', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
const b64 = await page.evaluate(draw, 2732);
const buf = Buffer.from(b64, 'base64');
const { writeFileSync } = await import('node:fs');
writeFileSync('resources/splash.png', buf);
writeFileSync('resources/splash-dark.png', buf);
// aperçu léger pour vérifier
writeFileSync('store/splash-preview.png', buf);
await browser.close();
console.log('splash généré : resources/splash.png (2732×2732)', buf.length, 'octets');
