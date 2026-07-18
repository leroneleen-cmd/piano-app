import { chromium } from 'playwright';

// Icône Pianote : uniquement un clavier de piano sur fond ambre (sans note).
const draw = (S) => {
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const x = c.getContext('2d');
  // fond ambre (dégradé)
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#f8c368'); g.addColorStop(1, '#e0871f');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  // léger halo doux en haut
  const rg = x.createRadialGradient(S*0.5, S*0.28, 0, S*0.5, S*0.28, S*0.7);
  rg.addColorStop(0, 'rgba(255,255,255,0.18)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, S, S);

  // zone clavier centrée
  const kw = S * 0.66, kh = S * 0.46;
  const kx = (S - kw) / 2, ky = (S - kh) / 2;
  const r = S * 0.035;
  const round = (X, Y, W, H, rTL, rTR, rBR, rBL) => {
    x.beginPath();
    x.moveTo(X + rTL, Y);
    x.arcTo(X + W, Y, X + W, Y + H, rTR);
    x.arcTo(X + W, Y + H, X, Y + H, rBR);
    x.arcTo(X, Y + H, X, Y, rBL);
    x.arcTo(X, Y, X + W, Y, rTL);
    x.closePath();
  };
  // ombre portée du clavier
  x.save();
  x.shadowColor = 'rgba(90,45,0,0.35)'; x.shadowBlur = S*0.03; x.shadowOffsetY = S*0.012;
  x.fillStyle = '#1c1f27';
  round(kx - S*0.012, ky - S*0.012, kw + S*0.024, kh + S*0.024, r, r, r, r); x.fill();
  x.restore();

  // touches blanches
  const nW = 7;
  const gap = kw * 0.008;
  const wkw = (kw - gap * (nW - 1)) / nW;
  const wkr = S * 0.02;
  for (let i = 0; i < nW; i++) {
    const wx = kx + i * (wkw + gap);
    x.fillStyle = '#f7f8fb';
    round(wx, ky, wkw, kh, i === 0 ? r : wkr*0.4, i === nW-1 ? r : wkr*0.4, i === nW-1 ? r : wkr, i === 0 ? r : wkr);
    x.fill();
  }
  // touches noires (après C,D puis F,G,A)
  const bkh = kh * 0.6;
  const bkw = wkw * 0.62;
  const after = [0, 1, 3, 4, 5];
  x.fillStyle = '#14161c';
  after.forEach(i => {
    const bx = kx + (i + 1) * (wkw + gap) - bkw / 2 - gap / 2;
    round(bx, ky, bkw, bkh, 0, 0, S*0.012, S*0.012);
    x.fill();
  });
  return c.toDataURL('image/png').split(',')[1];
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('about:blank');
const b64 = await page.evaluate(draw, 1024);
const { writeFileSync } = await import('node:fs');
writeFileSync('icons/icon-1024.png', Buffer.from(b64, 'base64'));
await browser.close();
console.log('icône générée : icons/icon-1024.png (clavier seul)');
