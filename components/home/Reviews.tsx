"use client";

import { useEffect, useState } from "react";
import { MessageSquareHeart, Star, Send } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { getReviews, addReview } from "@/lib/api/reviews";
import { showSuccess, showError } from "@/components/common/Toast";
import type { Review } from "@/types";

function Stars({ n, size = "w-3.5 h-3.5" }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "text-card-border"}`}
        />
      ))}
    </span>
  );
}

/** Public reviews — list + form (localStorage, no login). */
export default function Reviews() {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getReviews().then(setReviews).catch(() => {});
  }, []);

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async () => {
    if (!name.trim() || !text.trim()) {
      showError(t("rev.need"));
      return;
    }
    setBusy(true);
    try {
      const rev = await addReview({ name, rating, text });
      setReviews((prev) => [rev, ...prev]);
      setName("");
      setText("");
      setRating(5);
      showSuccess(t("home.revDone"));
    } catch (e) {
      showError(t(e instanceof Error ? e.message : "home.revNeed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-16">
      <div className="text-center mb-6">
        <p className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full border border-amber-500/20">
          <MessageSquareHeart className="w-4 h-4" /> {t("home.revTag")}
        </p>
        <h2 className="text-2xl font-black mt-3">
          {t("home.revA")} <span className="text-brand">{t("home.revB")}</span>
        </h2>
        <p className="text-muted text-xs mt-1">{t("home.revSub")}</p>
        {reviews.length > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 font-black">
            <Stars n={avg} size="w-4 h-4" />
            <span className="text-lg">{avg.toFixed(1)}</span>
            <span className="text-xs font-bold text-muted">{t("home.revCount", { n: reviews.length })}</span>
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* list */}
        <div className="space-y-3">
          {reviews.slice(0, 4).map((r) => (
            <div key={r._id} className="bg-card-bg border border-card-border rounded-lg p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-8 h-8 rounded-full bg-brand/10 text-brand font-black text-sm inline-flex items-center justify-center shrink-0">
                  {r.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{r.name}</p>
                  <p className="text-[11px] text-muted">
                    {new Date(r.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Stars n={r.rating} />
              </div>
              <p className="text-sm text-text-main/90 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>

        {/* form */}
        <div className="bg-card-bg border border-card-border rounded-lg p-5 h-fit md:sticky md:top-24">
          <p className="font-black mb-3">{t("home.revSub")}</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("home.revNamePh")}
            maxLength={40}
            className="w-full bg-bg-main border border-card-border rounded-md px-4 py-2.5 text-sm mb-3 outline-none focus:border-brand/60"
          />
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                aria-label={`${i} star`}
                className="cursor-pointer hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-card-border"}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("home.revTextPh")}
            rows={3}
            maxLength={300}
            className="w-full bg-bg-main border border-card-border rounded-md px-4 py-2.5 text-sm mb-3 outline-none focus:border-brand/60 resize-none"
          />
          <button
            onClick={submit}
            disabled={busy}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-black text-sm rounded-md px-4 py-3 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition"
          >
            <Send className="w-4 h-4" />
            {busy ? t("c.loading") : t("home.revBtn")}
          </button>
        </div>
      </div>
    </section>
  );
}
