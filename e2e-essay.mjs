import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const SHOT = "/tmp/claude-0/-home-user-crazy-monkey/c72d3c2b-3d38-59cb-bf4f-e8df0cccbc8c/scratchpad";
const errors = [];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 1800 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});
const panel = (title) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) });

await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

// English syllabus seed lands in the coverage table
await page.goto(`${BASE}/syllabus/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "载入英文考纲（老师版）" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /导入到英文/ }).click();
await page.waitForTimeout(400);
console.log("seeded english:", (await panel("英文 · 考点").innerText()).replace(/\n+/g, " | "));

// Thesis rules: a split sentence and a missing heading must both be caught
await page.goto(`${BASE}/essay/`, { waitUntil: "networkidle" });
const headingInputs = panel("三个大标题").locator("input");
await headingInputs.nth(0).fill("economic growth");
await headingInputs.nth(1).fill("public health");
await headingInputs.nth(2).fill("social cohesion");
await panel("开头三件套").locator("textarea").nth(2)
  .fill("This essay will discuss economic growth. It will also cover public health.");
await page.waitForTimeout(300);
console.log("--- THESIS CHECKS (bad) ---");
console.log(await panel("开头三件套").locator("ul").innerText());

await panel("开头三件套").locator("textarea").nth(2)
  .fill("Rapid urbanisation reshapes a nation through economic growth, public health, and social cohesion.");
await page.waitForTimeout(300);
console.log("--- THESIS CHECKS (good) ---");
console.log(await panel("开头三件套").locator("ul").innerText());

// Unconfirmed fifth level must be flagged, not silently invented
console.log(
  "fifth level warning:",
  await page.getByText("这一层的名字还没确认").isVisible(),
);

await panel("开头三件套").locator("textarea").nth(0).fill("Cities are growing faster than ever.");
const levelInputs = panel("5 Levels of Analysis").locator("input");
await levelInputs.nth(0).fill("individual stress and job prospects");
await levelInputs.nth(3).fill("national GDP and policy");
await panel("5 Levels of Analysis").getByRole("button", { name: /批这份计划/ }).click();
await page.waitForTimeout(400);
console.log("--- ESSAY PLAN PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");

await panel("Paper 2 · 五个部分").locator("li").first().getByRole("button", { name: "出题练这部分" }).click();
await page.waitForTimeout(400);
console.log("--- PAPER 2 DRILL PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");

await page.screenshot({ path: `${SHOT}/09-essay.png`, fullPage: true });

// Nav active state
await page.goto(`${BASE}/essay/`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
console.log(
  "nav active tab:",
  await page.locator("nav a.bg-accent").innerText(),
);

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/essay/`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
console.log(
  "mobile overflow:",
  await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
);
await mobile.screenshot({ path: `${SHOT}/10-essay-mobile.png`, fullPage: true });

console.log("\nERRORS:", errors.length ? errors : "none");
await browser.close();
