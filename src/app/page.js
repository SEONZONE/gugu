import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import LockDialog from "@/components/LockDialog";
import LockedBackdrop from "@/components/LockedBackdrop";
import { MonthUploadButton, UploadZone } from "@/components/Upload";
import YearSelect from "@/components/YearSelect";
import { IconArrowRight, IconChevronRight } from "@/components/icons";
import { isUnlocked } from "@/lib/auth";
import { listLedgers, toKey } from "@/lib/ledgers";
import { formatMonthDay } from "@/lib/format";
import styles from "./page.module.css";

export default function Home({ searchParams }) {
  return (
    <Suspense fallback={<LockedBackdrop />}>
      <HomeGate searchParams={searchParams} />
    </Suspense>
  );
}

async function HomeGate({ searchParams }) {
  if (!(await isUnlocked())) {
    return (
      <>
        <LockedBackdrop />
        <LockDialog />
      </>
    );
  }
  const { year } = await searchParams;
  return <Archive yearParam={year} />;
}

async function Archive({ yearParam }) {
  const ledgers = await listLedgers();
  const thisYear = new Date().getFullYear();
  const requested = /^\d{4}$/.test(yearParam ?? "") ? Number(yearParam) : null;
  const year = requested ?? ledgers.at(-1)?.year ?? thisYear;
  const years = [...new Set([thisYear, year, ...ledgers.map((l) => l.year)])].sort(
    (a, b) => b - a,
  );
  const byMonth = new Map(ledgers.filter((l) => l.year === year).map((l) => [l.month, l]));
  const yearWord = year === thisYear ? "올해" : `${year}년에`;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>우리 둘이 함께 쓰는 가계부</p>
            <h1 className={`display ${styles.title}`}>{year}년 가계부 보관함</h1>
            <p className={styles.summary}>
              {byMonth.size > 0
                ? `${yearWord} ${byMonth.size}개의 달이 기록됐어요`
                : `${yearWord} 올린 가계부가 아직 없어요`}
            </p>
          </div>
          <div className={styles.yearPicker}>
            <label htmlFor="year">연도</label>
            <YearSelect years={years} value={year} className={styles.select} />
          </div>
        </section>

        <UploadZone />

        <section className={styles.months}>
          <h2 className={`display ${styles.sectionTitle}`}>월별 가계부</h2>
          <div className={styles.grid}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const ledger = byMonth.get(month);
              const num = String(month).padStart(2, "0");
              if (!ledger) {
                return (
                  <article key={month} className={styles.emptyCard}>
                    <span className={`display ${styles.num} ${styles.numEmpty}`}>{num}</span>
                    <div className={styles.emptyBody}>
                      <span>{month}월 가계부가 아직 없어요</span>
                      <MonthUploadButton monthKey={toKey(year, month)} className={`btn ${styles.emptyButton}`}>
                        {month}월 파일 올리기
                      </MonthUploadButton>
                    </div>
                  </article>
                );
              }
              return (
                <Link key={month} href={`/view/${ledger.key}`} className={styles.card}>
                  <span className={`display ${styles.num}`}>{num}</span>
                  <div className={styles.cardTitle}>
                    <h3>{month}월 가계부</h3>
                    <span className="mono">{ledger.originalName}</span>
                  </div>
                  <div className={styles.cardFooter}>
                    <span>{formatMonthDay(ledger.uploadedAt)} 올림</span>
                    <span className={styles.open}>
                      열기
                      <IconArrowRight size={16} />
                    </span>
                  </div>
                  <IconChevronRight className={styles.chevron} />
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
