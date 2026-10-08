import { expect, test } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

test('首页进入文档、阅读参考和回到介绍区', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Read the docs', exact: true }).click();
  await expect(page.getByRole('heading', { name: '运行第一个 Iris Agent', level: 1 })).toBeVisible();
  const metadata = JSON.parse(await readFile('site/.generated/metadata.json', 'utf8'));
  await expect(page.getByText(metadata.version || '开发预览', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: '模型配置', exact: true }).first().click();
  await expect(page).toHaveURL(/configuration\.html#/);
  await page.reload();
  await expect(page.getByRole('heading', { name: /^配置参考/, level: 1 })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main Navigation' }).getByRole('link', { name: 'Explore', exact: true }).click();
  await expect(page).toHaveURL(/\/iris-web\/#explore$/);
  await expect(page.getByRole('heading', { name: 'A kit you can shape' })).toBeInViewport();
  await page.getByRole('link', { name: 'Back to top ↑' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(180);
  await expect(page.getByRole('link', { name: 'Feedback', exact: true })).toHaveAttribute('href', 'https://github.com/Tsubaki-01/Iris/issues');
});

test('安装复制使用文档中的完整代码块', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.getByRole('button', { name: '复制安装命令' }).click();
  const snippets = JSON.parse(await readFile('site/.generated/home-snippets.json', 'utf8'));
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')).toBe(snippets.install);
});

test('中文和 SDK 搜索能导航至真实文档', async ({ page }) => {
  await page.goto('docs/getting-started/quickstart.html');
  await page.getByRole('button', { name: '搜索文档' }).click();
  const search = page.getByRole('searchbox');
  for (const term of ['持久化', '上下文', '人工交互', 'AgentRunner']) {
    await search.fill('');
    await expect(page.locator('.VPLocalSearchBox .result')).toHaveCount(0);
    await search.fill(term);
    await expect(page.locator('.VPLocalSearchBox .result').first()).toBeVisible();
  }
  await page.locator('.VPLocalSearchBox .result').first().click();
  await expect(page).toHaveURL(/\/docs\/.+\.html/);
});

test('架构图真实渲染，源码目录链接使用同版提交', async ({ page }) => {
  await page.goto('docs/design/architecture.html');
  for (const [document, title] of [['architecture', '架构总览'], ['context-engineering', '上下文工程'], ['human-interaction', '人工交互']]) {
    if (document !== 'architecture') {
      await page.getByRole('navigation', { name: 'Sidebar Navigation' }).getByRole('link', { name: title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/design/${document}\\.html$`));
    }
    await expect(page.locator('.iris-diagram svg').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.iris-diagram > div > svg')).toHaveCount(await page.locator('.iris-diagram').count(), { timeout: 20000 });
    await expect(page.locator('.iris-diagram [role="alert"]')).toHaveCount(0);
  }
  await page.goto('docs/contributing/source-map.html');
  const metadata = JSON.parse(await readFile('site/.generated/metadata.json', 'utf8'));
  await expect(page.locator('.vp-doc').getByRole('link', { name: 'harness', exact: true })).toHaveAttribute('href', `https://github.com/Tsubaki-01/Iris/tree/${metadata.sourceCommit}/src/iris/harness`);
});

test('首页和文档在各断点无整页横向溢出，素材完整', async ({ page }) => {
  await mkdir('output/playwright', { recursive: true });
  for (const width of [1920, 1440, 1024, 800, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
    for (const [name, route] of [['home', './'], ['docs', 'docs/getting-started/quickstart.html']]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      await expect.poll(() => page.locator('img').evaluateAll((images) => images.filter((image) => image.getBoundingClientRect().width > 0 && !(image as HTMLImageElement).complete).length)).toBe(0);
      const brokenImages = await page.locator('img').evaluateAll((images) => images.filter((image) => image.getBoundingClientRect().width > 0 && !(image as HTMLImageElement).naturalWidth).map((image) => (image as HTMLImageElement).src));
      expect(brokenImages).toEqual([]);
      await page.screenshot({ path: `output/playwright/${name}-${width}.png`, fullPage: false });
    }
  }
  await page.getByRole('button', { name: '文档导航' }).click();
  await expect(page.locator('.VPSidebar')).toBeVisible();
  await page.locator('.VPSidebar').getByRole('link', { name: '接入 Python 应用', exact: true }).click();
  await expect(page.getByRole('heading', { name: '将 Agent 接入 Python 应用' })).toBeVisible();
  await page.getByRole('button', { name: 'mobile navigation' }).click();
  await expect(page.locator('.VPNavScreen').getByRole('link', { name: 'Feedback', exact: true })).toHaveAttribute('href', 'https://github.com/Tsubaki-01/Iris/issues');
});
