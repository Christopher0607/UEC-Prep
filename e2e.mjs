import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const SHOT = "/tmp/claude-0/-home-user-crazy-monkey/c72d3c2b-3d38-59cb-bf4f-e8df0cccbc8c/scratchpad";
const errors = [];
const notFound = [];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 1600 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});
page.on("response", (r) => {
  if (r.status() === 404) notFound.push(r.url());
});

const go = (p) => page.goto(BASE + p, { waitUntil: "networkidle" });
/** Panel bodies live in <section>, not in the <h2>'s parent div. */
const panel = (title) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) });

await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

await go("/");
await page.waitForTimeout(1200);
console.log("countdown:", (await page.locator(".tnum").first().innerText()).replace(/\n/g, " "));
console.log("48h warning:", await page.getByText("头 48 小时考掉四科").isVisible());

// Syllabus — import into 高级数学, not the default subject
await go("/syllabus/");
await panel("考点覆盖表").locator("select").selectOption("advmath");
await page.waitForTimeout(200);
await page.locator("textarea").fill("微积分 | 链式法则\n微积分 | 隐函数微分\n三角函数 | 和差化积");
await page.getByRole("button", { name: /导入到/ }).click();
await page.waitForTimeout(300);
await page.locator("li", { hasText: "链式法则" }).getByRole("button", { name: "熟练，能默写" }).click();
await page.waitForTimeout(200);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
await panel("考点覆盖表").locator("select").selectOption("advmath");
await page.waitForTimeout(300);
console.log(
  "syllabus after reload:",
  (await panel("高级数学 · 考点").innerText()).replace(/\n+/g, " | "),
);
await page.getByRole("button", { name: "只看盲区" }).click();
await page.waitForTimeout(300);
console.log(
  "weak-only filter:",
  (await panel("高级数学 · 考点").innerText()).replace(/\n+/g, " | "),
);
await page.screenshot({ path: `${SHOT}/02-syllabus.png`, fullPage: true });

// Mistakes — attach to a real topic this time
await go("/mistakes/");
await panel("记一条错题").locator("select").first().selectOption("advmath");
await page.waitForTimeout(200);
await panel("记一条错题").locator("select").nth(1).selectOption({ label: "微积分 — 隐函数微分" });
const ta = panel("记一条错题").locator("textarea");
await ta.nth(0).fill("Find dy/dx when x^3 + y^3 = 6xy");
await ta.nth(1).fill("3x^2 + 3y^2 = 6y ... then I stopped");
await page.getByPlaceholder(/两边同时对/).fill("不知道 y^3 求导要乘 dy/dx");
await panel("记一条错题").locator("select").nth(2).selectOption("method");
await page.getByRole("button", { name: "记下来" }).click();
await page.waitForTimeout(400);
await panel("错题本").locator("li").first().getByRole("button", { name: /复制给 Claude/ }).click();
await page.waitForTimeout(400);
console.log("--- MISTAKE PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");
await page.screenshot({ path: `${SHOT}/03-mistakes.png`, fullPage: true });

// Flashcards
await go("/flashcards/");
await page.locator("textarea").fill("机会成本的定义是什么？|放弃的其他选项中价值最高的那一个。\n需求定律？|价升量跌，价跌量升。");
await page.getByRole("button", { name: "导入", exact: true }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /先自己想/ }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /记得（/ }).click();
await page.waitForTimeout(200);
// Forget the second card — it must drop back to box 0 and stay in the queue.
await page.getByRole("button", { name: /先自己想/ }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "忘了" }).click();
await page.waitForTimeout(400);
console.log("after forget:", (await panel("今天要背的").innerText()).replace(/\n+/g, " | "));
console.log("card library:", (await panel("卡片库").innerText()).replace(/\n+/g, " | "));

// Papers
await go("/papers/");
const inputs = panel("记一次成绩").locator('input[inputmode="numeric"]');
await page.getByPlaceholder("2023 Paper 1").fill("2023 高数 P1");
await inputs.nth(0).fill("62");
await inputs.nth(1).fill("100");
await inputs.nth(2).fill("135");
await inputs.nth(3).fill("120");
await page.getByRole("button", { name: "记下来" }).click();
await page.waitForTimeout(500);
console.log("--- TREND ---");
console.log(await panel("成绩走势").innerText());
console.log("--- END ---");
await page.screenshot({ path: `${SHOT}/05-papers.png`, fullPage: true });

// Dashboard reflects everything
await go("/");
await page.waitForTimeout(800);
console.log("--- DASHBOARD ---");
console.log(await panel("七科现况").innerText());
console.log("--- TODAY ---");
console.log((await panel("今日").innerText()).replace(/\n+/g, " | "));
await panel("今日").getByRole("button", { name: /周复盘/ }).click();
await page.waitForTimeout(400);
console.log("--- WEEKLY REVIEW PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");
await page.screenshot({ path: `${SHOT}/06-dashboard-filled.png`, fullPage: true });


// Feynman page
await go("/feynman/");
await panel("反向讲题（费曼）").locator("select").first().selectOption("advmath");
await page.waitForTimeout(300);
await panel("反向讲题（费曼）").locator("select").nth(1).selectOption({ label: "微积分 — 隐函数微分" });
await page.waitForTimeout(200);
await page.locator("textarea").fill("隐函数微分就是两边同时对 x 求导，y 的项要乘 dy/dx。");
await panel("反向讲题（费曼）").getByRole("button", { name: /挑漏洞/ }).click();
await page.waitForTimeout(400);
console.log("--- FEYNMAN PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");
// Updating mastery from the Feynman page must write through to the coverage table.
await panel("讲完了，更新掌握度").getByRole("button", { name: "会做但慢或易错" }).click();
await page.waitForTimeout(300);
await go("/syllabus/");
await panel("考点覆盖表").locator("select").selectOption("advmath");
await page.waitForTimeout(300);
console.log("coverage after feynman:", (await panel("高级数学 · 考点").innerText()).replace(/\n+/g, " | "));
await page.screenshot({ path: `${SHOT}/08-feynman.png`, fullPage: true });

// Backup
await go("/data/");
await page.waitForTimeout(400);
console.log("backup:", (await panel("备份").innerText()).replace(/\n+/g, " | "));

// Mobile
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE + "/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(900);
console.log(
  "mobile overflow:",
  await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
);
await mobile.screenshot({ path: `${SHOT}/07-mobile.png`, fullPage: true });

console.log("\n404s:", notFound.length ? notFound : "none");
console.log("ERRORS:", errors.length ? errors : "none");
await browser.close();
