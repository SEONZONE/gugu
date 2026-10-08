"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  endSession,
  isPasswordConfigured,
  isUnlocked,
  startSession,
} from "@/lib/auth";
import {
  deleteLedger,
  isValidKey,
  keyFromFileName,
  parseKey,
  saveLedger,
  saveMemo,
} from "@/lib/ledgers";
import { monthLabel } from "@/lib/format";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const LOCKED_ERROR = "잠겨 있어요. 새로고침한 뒤 비밀번호를 다시 입력해 주세요.";

export async function unlock(prevState, formData) {
  if (!isPasswordConfigured()) {
    return { error: "서버에 비밀번호(GUGU_PASSWORD)가 설정되지 않았어요." };
  }
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { error: "비밀번호를 입력해 주세요." };
  }
  if (!checkPassword(password)) {
    // 무작위 대입을 늦추기 위해 틀리면 잠깐 기다린다.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "비밀번호가 맞지 않아요." };
  }
  await startSession();
  return { error: null };
}

export async function lock() {
  await endSession();
  redirect("/");
}

export async function uploadLedgers(prevState, formData) {
  if (!(await isUnlocked())) return { error: LOCKED_ERROR };

  const fixedKey = formData.get("month");
  if (fixedKey && !isValidKey(fixedKey)) {
    return { error: "잘못된 달이에요." };
  }

  let files = formData
    .getAll("files")
    .filter((file) => typeof file === "object" && file.size > 0);
  if (files.length === 0) {
    return { error: "올릴 파일을 골라 주세요." };
  }
  if (fixedKey) files = files.slice(0, 1);

  const saved = [];
  const skipped = [];
  for (const file of files) {
    if (!/\.html?$/i.test(file.name)) {
      skipped.push(`${file.name}(HTML 파일이 아니에요)`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      skipped.push(`${file.name}(15MB보다 커요)`);
      continue;
    }
    const key = fixedKey || keyFromFileName(file.name);
    if (!key) {
      skipped.push(`${file.name}(파일 이름에서 연월을 찾지 못했어요)`);
      continue;
    }
    const data = Buffer.from(await file.arrayBuffer());
    await saveLedger(key, { originalName: file.name, data });
    const { year, month } = parseKey(key);
    saved.push(monthLabel(year, month));
  }

  if (saved.length > 0) refresh();
  return {
    message: saved.length > 0 ? `${saved.join(", ")} 가계부를 올렸어요.` : null,
    error: skipped.length > 0 ? `올리지 못한 파일: ${skipped.join(", ")}` : null,
  };
}

export async function deleteLedgerAction(key) {
  if (!(await isUnlocked()) || !isValidKey(key)) redirect("/");
  await deleteLedger(key);
  redirect(`/?year=${parseKey(key).year}`);
}

export async function saveMemoAction(key, prevState, formData) {
  if (!(await isUnlocked())) return { error: LOCKED_ERROR };
  if (!isValidKey(key)) return { error: "잘못된 달이에요." };
  const memo = String(formData.get("memo") ?? "").trim().slice(0, 500);
  const ok = await saveMemo(key, memo);
  if (!ok) return { error: "이 달의 가계부를 찾지 못했어요." };
  return { error: null, savedAt: Date.now() };
}
