import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// 가계부 파일은 달마다 `YYYY-MM.html`(원본)과 `YYYY-MM.json`(메타데이터)으로 저장한다.
const LEDGER_DIR = process.env.LEDGER_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.LEDGER_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "ledgers");

const KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidKey(key) {
  return typeof key === "string" && KEY_PATTERN.test(key);
}

export function toKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseKey(key) {
  const [, year, month] = key.match(KEY_PATTERN);
  return { year: Number(year), month: Number(month) };
}

// "2026-09_가계부.html", "202609.html", "2026년 9월.html" 등에서 연월을 찾는다.
export function keyFromFileName(name) {
  const match = name.match(/(20\d{2})\s*[-_./년]?\s*(\d{1,2})(?!\d)/);
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return toKey(match[1], month);
}

function filePath(key, ext) {
  if (!isValidKey(key)) throw new Error(`잘못된 가계부 키: ${key}`);
  return path.join(/*turbopackIgnore: true*/ LEDGER_DIR, `${key}.${ext}`);
}

async function readMeta(key) {
  try {
    const meta = JSON.parse(await readFile(filePath(key, "json"), "utf8"));
    return { key, ...parseKey(key), ...meta };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

export async function listLedgers() {
  let names;
  try {
    names = await readdir(LEDGER_DIR);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const keys = names
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length))
    .filter(isValidKey)
    .sort();
  const metas = await Promise.all(keys.map(readMeta));
  return metas.filter(Boolean);
}

export async function getLedger(key) {
  if (!isValidKey(key)) return null;
  return readMeta(key);
}

export async function readLedgerHtml(key) {
  return readFile(filePath(key, "html"));
}

export async function saveLedger(key, { originalName, data }) {
  await mkdir(LEDGER_DIR, { recursive: true });
  const previous = await readMeta(key);
  await writeFile(filePath(key, "html"), data);
  const meta = {
    originalName,
    size: data.length,
    uploadedAt: new Date().toISOString(),
    memo: previous?.memo ?? "",
  };
  await writeFile(filePath(key, "json"), JSON.stringify(meta, null, 2));
}

export async function saveMemo(key, memo) {
  const previous = await readMeta(key);
  if (!previous) return false;
  const { originalName, size, uploadedAt } = previous;
  const meta = { originalName, size, uploadedAt, memo };
  await writeFile(filePath(key, "json"), JSON.stringify(meta, null, 2));
  return true;
}

export async function deleteLedger(key) {
  await rm(filePath(key, "json"), { force: true });
  await rm(filePath(key, "html"), { force: true });
}
