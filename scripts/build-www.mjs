// Assembles the native web bundle (www/) from the web assets.
// Run before `npx cap sync`. No dependencies — plain Node.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });

cpSync('index.html', 'www/index.html');
cpSync('manifest.webmanifest', 'www/manifest.webmanifest');
if (existsSync('sw.js')) cpSync('sw.js', 'www/sw.js');
cpSync('icons', 'www/icons', { recursive: true });

console.log('✓ www/ built (index.html, manifest, sw.js, icons/)');
