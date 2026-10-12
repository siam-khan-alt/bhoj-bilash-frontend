"use client";

import toast from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { getStoredLang, translate } from "@/lib/i18n/dict";

const baseStyle: React.CSSProperties = {
  background: "var(--color-card-bg)",
  color: "var(--color-text-main)",
  border: "1px solid var(--color-card-border)",
  borderRadius: "12px",
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: 600,
};

export const showSuccess = (message: string) => {
  toast(message, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: <CheckCircle className="w-5 h-5 text-accent" /> as any,
    style: baseStyle,
  });
};

export const showError = (message: string) => {
  toast(message, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: <XCircle className="w-5 h-5 text-brand" /> as any,
    style: baseStyle,
  });
};

export const showConfirm = (message: string, onConfirm: () => void) => {
  const lang = getStoredLang();
  const cancelTxt = translate(lang, "c.cancel");
  const confirmTxt = translate(lang, "c.confirm");
  toast(
    (t) => (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>{message}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold rounded-md border border-card-border text-text-main"
          >
            {cancelTxt}
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-md bg-brand text-white"
          >
            {confirmTxt}
          </button>
        </div>
      </div>
    ),
    { style: baseStyle, duration: Infinity }
  );
};
