import { useEffect, useId, useRef, type ReactNode } from "react";
import { id as t } from "../strings/id";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Extra content shown between the title and the message (for example a summary). */
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal confirmation using the native <dialog>: focus is trapped and Esc cancels. */
export function ConfirmDialog({
  open,
  title,
  message,
  children,
  confirmLabel,
  cancelLabel = t.common.cancel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      // The title and message exist only while open, so only point at them then.
      aria-labelledby={open ? titleId : undefined}
      aria-describedby={open ? messageId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      {open && (
        <div className="dialog__body">
          <h2 id={titleId}>{title}</h2>
          {children}
          <p id={messageId}>{message}</p>
          <div className="dialog__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel} autoFocus>
              {cancelLabel}
            </button>
            <button type="button" className={`btn ${danger ? "btn--danger" : "btn--primary"}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
