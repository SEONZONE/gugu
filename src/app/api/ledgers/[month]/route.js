import { isUnlocked } from "@/lib/auth";
import { getLedger, readLedgerHtml } from "@/lib/ledgers";

// 올린 HTML을 그대로 돌려준다. CSP sandbox로 이 사이트의 쿠키·저장소와 분리해서 실행한다.
export async function GET(request, { params }) {
  if (!(await isUnlocked())) {
    return new Response("잠겨 있어요.", { status: 401 });
  }

  const { month } = await params;
  const ledger = await getLedger(month);
  if (!ledger) {
    return new Response("가계부를 찾지 못했어요.", { status: 404 });
  }

  const body = await readLedgerHtml(month);
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": "sandbox allow-scripts allow-popups allow-modals allow-forms",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
  if (new URL(request.url).searchParams.has("download")) {
    headers["Content-Disposition"] =
      `attachment; filename="${month}.html"; filename*=UTF-8''${encodeURIComponent(ledger.originalName)}`;
  }
  return new Response(body, { headers });
}
