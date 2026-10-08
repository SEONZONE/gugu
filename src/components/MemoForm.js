"use client";

import { useActionState } from "react";
import styles from "./MemoForm.module.css";

export default function MemoForm({ action, defaultValue }) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="memo" className={styles.label}>
        서로에게 남기는 짧은 메모
      </label>
      <textarea
        id="memo"
        name="memo"
        rows={3}
        maxLength={500}
        defaultValue={defaultValue}
        placeholder="예: 다음 달엔 외식 줄여보자"
        className={styles.textarea}
      />
      <div className={styles.footer}>
        <span aria-live="polite">
          {state.error && <span className="form-error">{state.error}</span>}
          {!state.error && state.savedAt && <span className="form-message">저장했어요</span>}
        </span>
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "저장하는 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
