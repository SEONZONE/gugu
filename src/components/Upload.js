"use client";

import { useActionState, useRef, useState } from "react";
import { uploadLedgers } from "@/app/actions";
import { IconUpload } from "./icons";
import styles from "./Upload.module.css";

function useUploader() {
  const [state, formAction, pending] = useActionState(uploadLedgers, {
    message: null,
    error: null,
  });
  const formRef = useRef(null);
  const inputRef = useRef(null);

  function submit() {
    formRef.current.requestSubmit();
    // 같은 파일을 다시 골라도 change가 일어나도록 비운다. FormData는 submit 시점에 이미 만들어졌다.
    inputRef.current.value = "";
  }

  function choose() {
    inputRef.current.click();
  }

  return { state, formAction, pending, formRef, inputRef, submit, choose };
}

function Feedback({ state }) {
  return (
    <div aria-live="polite" className={styles.feedback}>
      {state.message && <p className="form-message">{state.message}</p>}
      {state.error && <p className="form-error">{state.error}</p>}
    </div>
  );
}

export function UploadZone() {
  const { state, formAction, pending, formRef, inputRef, submit, choose } = useUploader();
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length === 0) return;
    inputRef.current.files = event.dataTransfer.files;
    submit();
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-label="가계부 파일 올리기"
      className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        name="files"
        type="file"
        accept=".html,.htm,text/html"
        multiple
        hidden
        onChange={submit}
      />
      <div className={styles.zoneBody}>
        <div className={styles.zoneIcon}>
          <IconUpload size={26} strokeWidth={1.8} />
        </div>
        <div className={styles.zoneText}>
          <strong>HTML 가계부 파일을 여기로 끌어다 놓으세요</strong>
          <span>
            .html 파일 · 여러 개를 한 번에 올릴 수 있어요 · 파일 이름의 날짜로 달을 자동
            분류해요
          </span>
          <Feedback state={state} />
        </div>
      </div>
      <button
        type="button"
        className={`btn btn-primary ${styles.zoneButton}`}
        onClick={choose}
        disabled={pending}
      >
        <IconUpload size={18} />
        {pending ? "올리는 중…" : "파일 선택"}
      </button>
    </form>
  );
}

// 특정 달에 파일을 올리거나 바꾼다. 파일 이름과 상관없이 monthKey 달로 저장된다.
export function MonthUploadButton({ monthKey, children, className = "btn" }) {
  const { state, formAction, pending, formRef, inputRef, submit, choose } = useUploader();

  return (
    <form ref={formRef} action={formAction} className={styles.monthForm}>
      <input type="hidden" name="month" value={monthKey} />
      <input
        ref={inputRef}
        name="files"
        type="file"
        accept=".html,.htm,text/html"
        hidden
        onChange={submit}
      />
      <button
        type="button"
        className={className}
        onClick={choose}
        disabled={pending}
      >
        {pending ? "올리는 중…" : children}
      </button>
      {state.error && <p className="form-error">{state.error}</p>}
    </form>
  );
}
