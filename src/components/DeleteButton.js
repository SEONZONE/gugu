"use client";

import { useFormStatus } from "react-dom";

function SubmitButton({ className }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "삭제하는 중…" : "이 달 파일 삭제"}
    </button>
  );
}

export default function DeleteButton({ action, label, className }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`${label} 가계부를 삭제할까요? 되돌릴 수 없어요.`)) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton className={className} />
    </form>
  );
}
