import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const SHOT = "/tmp/claude-0/-home-user-crazy-monkey/c72d3c2b-3d38-59cb-bf4f-e8df0cccbc8c/scratchpad";
const errors = [];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1100, height: 2000 } });
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});
const panel = (title) =>
  page.locator("section").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

// The fifth level of analysis is now confirmed — the warning must be gone.
await page.goto(`${BASE}/essay/`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
console.log("Global level present:", await page.getByText("Global", { exact: true }).isVisible());
console.log("unconfirmed warning gone:", (await page.getByText("这一层的名字还没确认").count()) === 0);

// Chinese page: genre switching must change the header layout
await page.goto(`${BASE}/chinese/`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
console.log("--- 公函 skeleton ---");
console.log((await panel("应用文 · 骨架").innerText()).slice(0, 900));

await panel("应用文 · 骨架").locator("select").selectOption("qishi");
await page.waitForTimeout(300);
const qishi = await panel("应用文 · 骨架").innerText();
console.log("启事 says no 致: line:", qishi.includes("没有收信人栏，也没有「致：」"));
console.log("启事 paragraph count:", (qishi.match(/第 \S+ 段/g) ?? []).length);

await panel("应用文 · 骨架").locator("select").selectOption("tonggao");
await page.waitForTimeout(300);
const tonggao = await panel("应用文 · 骨架").innerText();
console.log("通告 has 致：全体:", tonggao.includes("致：全体"));

// Grading prompt must carry the element checklist
await panel("批我的应用文").locator("textarea").fill("修齐中学童军队\n致：全体队员\n取消露营通告\n为加强团队精神……");
await panel("批我的应用文").getByRole("button", { name: /批这篇通告/ }).click();
await page.waitForTimeout(400);
console.log("--- 应用文 GRADE PROMPT ---");
console.log(await page.evaluate(() => navigator.clipboard.readText()));
console.log("--- END ---");

// Essay outline prompt
await panel("作文 · 提纲检查").locator("input").first().fill("谈坚持");
const pts = panel("作文 · 提纲检查").locator("input");
await pts.nth(1).fill("坚持need目标");
await panel("作文 · 提纲检查").locator("textarea").first().fill("坚持是通往成功的必要条件");
await panel("作文 · 提纲检查").getByRole("button", { name: /批这份提纲/ }).click();
await page.waitForTimeout(400);
console.log("--- 作文提纲 PROMPT (head) ---");
console.log((await page.evaluate(() => navigator.clipboard.readText())).slice(0, 700));
console.log("--- END ---");

// Chinese syllabus seed
await page.goto(`${BASE}/syllabus/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "载入华文考纲（老师版）" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /导入到华文/ }).click();
await page.waitForTimeout(500);
const seeded = await panel("华文 · 考点").innerText();
console.log("chinese topics seeded:", (seeded.match(/删除/g) ?? []).length);
console.log("sections:", [...new Set(seeded.split("\n").filter((l) => l.startsWith("试卷")))].join(" | "));

await page.screenshot({ path: `${SHOT}/11-chinese.png`, fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/chinese/`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
console.log(
  "mobile overflow:",
  await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
);

console.log("\nERRORS:", errors.length ? errors : "none");
await browser.close();
