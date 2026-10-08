import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteLedgerAction, saveMemoAction } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";
import MemoForm from "@/components/MemoForm";
import { MonthUploadButton } from "@/components/Upload";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconExternal,
} from "@/components/icons";
import { isUnlocked } from "@/lib/auth";
import { isValidKey, listLedgers } from "@/lib/ledgers";
import { formatFullDate, formatSize, monthLabel } from "@/lib/format";
import styles from "./viewer.module.css";

export default function ViewerPage({ params }) {
  return (
    <Suspense fallback={<div className={styles.loading}>가계부를 불러오는 중…</div>}>
      <Viewer params={params} />
    </Suspense>
  );
}

async function Viewer({ params }) {
  if (!(await isUnlocked())) redirect("/");

  const { month: key } = await params;
  if (!isValidKey(key)) notFound();

  const ledgers = await listLedgers();
  const index = ledgers.findIndex((l) => l.key === key);
  if (index === -1) notFound();

  const ledger = ledgers[index];
  const prev = ledgers[index - 1];
  const next = ledgers[index + 1];
  const sameYear = ledgers.filter((l) => l.year === ledger.year);
  const src = `/api/ledgers/${key}?v=${encodeURIComponent(ledger.uploadedAt)}`;

  return (
    <>
      <header className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Link href={`/?year=${ledger.year}`} className="btn">
            <IconChevronLeft />
            보관함
          </Link>
          <div className={styles.heading}>
            <span>{ledger.year}년</span>
            <h1 className="display">{ledger.month}월 가계부</h1>
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <StepLink ledger={prev} label="이전 달">
            <IconChevronLeft />
          </StepLink>
          <StepLink ledger={next} label="다음 달">
            <IconChevronRight />
          </StepLink>
          <span className={styles.divider} />
          <a href={`/api/ledgers/${key}`} target="_blank" rel="noopener" className="btn">
            <IconExternal size={16} />
            새 창으로
          </a>
          <a href={`/api/ledgers/${key}?download`} className="btn">
            <IconDownload size={16} />
            내려받기
          </a>
        </div>
      </header>

      <div className={styles.layout}>
        <nav aria-label={`${ledger.year}년 달 선택`} className={styles.sidebar}>
          <span className={styles.sidebarYear}>{ledger.year}년</span>
          {sameYear.map((l) => (
            <Link
              key={l.key}
              href={`/view/${l.key}`}
              aria-current={l.key === key ? "page" : undefined}
              className={l.key === key ? styles.monthCurrent : styles.month}
            >
              {l.month}월
            </Link>
          ))}
        </nav>

        <main className={styles.content}>
          <div className={styles.contentMeta}>
            <span className="mono">{ledger.originalName}</span>
            <span>원본 HTML을 그대로 보여줘요</span>
          </div>
          <iframe
            key={src}
            src={src}
            title={`${monthLabel(ledger.year, ledger.month)} 가계부`}
            sandbox="allow-scripts allow-popups allow-modals allow-forms"
            className={styles.frame}
          />
        </main>

        <aside aria-label="파일 정보" className={styles.aside}>
          <section className={styles.panel}>
            <h2>파일 정보</h2>
            <dl className={styles.info}>
              <dt>파일</dt>
              <dd className="mono">{ledger.originalName}</dd>
              <dt>올린 날</dt>
              <dd>{formatFullDate(ledger.uploadedAt)}</dd>
              <dt>크기</dt>
              <dd>{formatSize(ledger.size)}</dd>
            </dl>
            <div className={styles.panelActions}>
              <MonthUploadButton monthKey={key} className={`btn btn-primary ${styles.full}`}>
                새 파일로 바꾸기
              </MonthUploadButton>
              <DeleteButton
                action={deleteLedgerAction.bind(null, key)}
                label={monthLabel(ledger.year, ledger.month)}
                className={`btn btn-danger ${styles.full}`}
              />
            </div>
          </section>
          <section className={styles.panel}>
            <h2>이 달의 한마디</h2>
            <MemoForm key={key} action={saveMemoAction.bind(null, key)} defaultValue={ledger.memo} />
          </section>
        </aside>
      </div>
    </>
  );
}

function StepLink({ ledger, label, children }) {
  if (!ledger) {
    return (
      <span className="btn icon-btn" aria-disabled="true" aria-label={label} role="link">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={`/view/${ledger.key}`}
      className="btn icon-btn"
      aria-label={`${label}: ${monthLabel(ledger.year, ledger.month)}`}
    >
      {children}
    </Link>
  );
}
