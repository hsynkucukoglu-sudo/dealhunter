import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const filePath = 'file:///' + path.resolve(__dirname, 'linkedin-post.html').split('\\').join('/');
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: path.resolve(__dirname, 'linkedin-post.png'),
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });

  await browser.close();
  console.log('Done: linkedin-post.png');
})();
