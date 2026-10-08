"use client";

import { useActionState } from "react";
import { unlock } from "@/app/actions";
import { IconLock } from "./icons";
import styles from "./LockDialog.module.css";

export default function LockDialog() {
  const [state, formAction, pending] = useActionState(unlock, { error: null });

  return (
    <div className={styles.overlay}>
      <form
        action={formAction}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-title"
        className={styles.dialog}
      >
        <div className={styles.head}>
          <div className={styles.badge}>
            <IconLock size={26} strokeWidth={1.8} />
          </div>
          <h1 id="lock-title" className={`display ${styles.title}`}>
            구구 가계부
          </h1>
          <p className={styles.lead}>우리 집 가계부예요. 비밀번호를 입력해 주세요.</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            autoFocus
            aria-invalid={state.error ? "true" : undefined}
            aria-describedby={state.error ? "password-error" : undefined}
            className={styles.input}
          />
          {state.error && (
            <p id="password-error" role="alert" className="form-error">
              {state.error}
            </p>
          )}
        </div>
        <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={pending}>
          {pending ? "확인하는 중…" : "들어가기"}
        </button>
      </form>
    </div>
  );
}
