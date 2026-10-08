import Link from "next/link";
import { lock } from "@/app/actions";
import { IconLock, LogoMark } from "./icons";
import styles from "./Header.module.css";

export function Brand() {
  return (
    <Link href="/" className={styles.brand}>
      <LogoMark />
      <span className="display">구구 가계부</span>
    </Link>
  );
}

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Brand />
        <nav aria-label="주 메뉴" className={styles.nav}>
          <Link href="/" className={styles.navCurrent} aria-current="page">
            보관함
          </Link>
          <form action={lock}>
            <button type="submit" className={styles.navButton}>
              <IconLock size={16} />
              잠그기
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
