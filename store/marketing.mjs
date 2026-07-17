import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const LANGS = ['fr', 'en', 'es', 'de', 'zh'];
const SCREENS = ['01-play', '02-plan', '03-songs', '04-courses', '05-duo'];
const CAPTIONS = {
  fr: ['Un vrai piano dans ta poche', 'Ta routine, chaque jour', 'Plus de 20 morceaux guidés', 'Des cours, du débutant à l’avancé', 'Main gauche, main droite, ensemble'],
  en: ['A real piano in your pocket', 'Your routine, every day', '20+ guided songs', 'Courses, beginner to advanced', 'Left hand, right hand, together'],
  es: ['Un piano de verdad en tu bolsillo', 'Tu rutina, cada día', 'Más de 20 piezas guiadas', 'Cursos, de principiante a avanzado', 'Mano izquierda, derecha, juntas'],
  de: ['Ein echtes Klavier in der Tasche', 'Deine Routine, jeden Tag', 'Über 20 geführte Stücke', 'Kurse, vom Anfänger zum Profi', 'Linke Hand, rechte Hand, zusammen'],
  zh: ['口袋里的真钢琴', '每天，专属你的练习', '20+ 首引导式歌曲', '从入门到进阶的课程', '左手、右手，合起来'],
};

function page(caption, dataUri) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1290px;height:2796px}
  .wrap{width:1290px;height:2796px;
    background:radial-gradient(1200px 900px at 50% 8%, rgba(245,180,85,.20), rgba(245,180,85,0) 60%), linear-gradient(160deg,#0e1119 0%,#161a26 55%,#241a2e 100%);
    display:flex;flex-direction:column;align-items:center;font-family:-apple-system,'PingFang SC','Hiragino Sans GB','Noto Sans CJK SC',BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
  .cap{padding:150px 110px 0;text-align:center}
  .cap h1{font-size:80px;line-height:1.14;font-weight:800;color:#fff;letter-spacing:-1px}
  .accent{display:block;width:120px;height:8px;border-radius:999px;background:linear-gradient(90deg,#f5b455,#e79b34);margin:44px auto 0}
  .phone{margin-top:70px;width:980px;border:16px solid #14161d;border-radius:96px;overflow:hidden;
    box-shadow:0 50px 130px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.04)}
  .phone img{width:100%;display:block}
  </style></head><body>
  <div class="wrap"><div class="cap"><h1>${caption}</h1><span class="accent"></span></div>
  <div class="phone"><img src="${dataUri}"></div></div></body></html>`;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
let n = 0;
for (const lang of LANGS) {
  const dir = `store/marketing/${lang}`; mkdirSync(dir, { recursive: true });
  for (let i = 0; i < SCREENS.length; i++) {
    const raw = readFileSync(`store/screenshots/6.7-inch/${lang}/${SCREENS[i]}.png`).toString('base64');
    await p.setContent(page(CAPTIONS[lang][i], 'data:image/png;base64,' + raw), { waitUntil: 'load' });
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${dir}/${SCREENS[i]}.png` });
    n++;
  }
}
await browser.close();
console.log('generated', n, 'marketing screenshots');
