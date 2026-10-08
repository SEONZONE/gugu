import { LogoMark } from "./icons";
import styles from "./LockedBackdrop.module.css";

// 잠겨 있을 때 비밀번호 창 뒤에 흐리게 깔리는 화면. 실제 가계부 데이터는 담지 않는다.
export default function LockedBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true" inert>
      <div className={styles.header}>
        <div className={styles.brand}>
          <LogoMark />
          <span className="display">구구 가계부</span>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.lineSm} />
          <div className={styles.lineLg} />
          <div className={styles.lineMd} />
        </div>
        <div className={styles.zone} />
        <div className={styles.grid}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardNum}>{String(i + 1).padStart(2, "0")}</div>
              <div className={styles.lineMd} />
              <div className={styles.lineSm} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
