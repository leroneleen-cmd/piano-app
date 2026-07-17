import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4599/index.html';
const LANGS = ['fr', 'en', 'es', 'de', 'zh'];
// Apple sizes: [css width, css height, deviceScaleFactor, folder]  -> pixel = css * dsf
const SIZES = [
  [430, 932, 3, '6.7-inch'],       // 1290 x 2796  (iPhone obligatoire)
  [414, 896, 3, '6.5-inch'],       // 1242 x 2688  (iPhone)
  [1024, 1366, 2, '12.9-inch-ipad'], // 2048 x 2732 (iPad obligatoire si app universelle)
];

const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })();
const seed = (lang) => JSON.stringify({
  totalNotes: 512, xp: 260, lessons: 4, songs: 3, earRight: 22, earTotal: 28,
  songsDone: { ode: true, twinkle: true, frere: true },
  tech: 5, duo: 1, iv: 16, read: 40, streak: 4, bestStreak: 7, lastGoalDay: '', dailyGoalXp: 60,
  day: { date: today, baseNotes: 472, baseXp: 215, baseLessons: 3, baseSongs: 2, baseEar: 20, baseTech: 4, baseDuo: 1, baseIv: 14 },
  program: { done: {} }, courses: { done: { l1a: true, l1b: true, l1c: true } }, recordings: [], userSongs: [], lang
});

// each screen: filename + a function body (string) run in the page to reach the state
const SCREENS = [
  ['01-play',  `switchTab('play');`],
  ['02-plan',  `switchTab('plan');`],
  ['03-songs', `switchTab('songs');`],
  ['04-courses', `switchTab('courses'); const c=document.querySelector('#courseList .song'); if(c) c.click(); const b=document.getElementById('courseStart'); if(b) b.click(); window.scrollTo(0,0);`],
  ['05-duo',   `switchTab('duo'); const s=document.querySelector('#duoList .song'); if(s) s.click(); const g=document.getElementById('duoGuide'); if(g) g.click();`],
];

const browser = await chromium.launch();
let count = 0;
for (const [w, h, dsf, folder] of SIZES) {
  for (const lang of LANGS) {
    const dir = `store/screenshots/${folder}/${lang}`;
    mkdirSync(dir, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
    await ctx.addInitScript((data) => { try { localStorage.setItem('clavier_v1', data); } catch (e) {} }, seed(lang));
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    for (const [name, body] of SCREENS) {
      await page.evaluate(new Function(body));
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${dir}/${name}.png` });
      count++;
    }
    await ctx.close();
  }
}
await browser.close();
console.log('generated', count, 'screenshots');
