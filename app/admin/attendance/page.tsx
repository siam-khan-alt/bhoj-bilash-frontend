"use client";

import { useEffect, useMemo, useState } from "react";
import { getStaff } from "@/lib/api/staff";
import {
  getAttendanceByDate,
  getAttendanceByMonth,
  markAttendance,
  updateAttendanceTimes,
  todayBD,
  workHours,
} from "@/lib/api/attendance";
import type { StaffMember, Attendance, AttendanceStatus } from "@/types";
import { showError, showSuccess } from "@/components/common/Toast";
import { useLang } from "@/context/LanguageContext";
import { jobKey } from "@/lib/i18n/dict";
import { Check, X, Minus, Palmtree, Clock } from "lucide-react";

const OPTS: { v: AttendanceStatus; labelKey: string; icon: React.ReactNode; cls: string }[] = [
  { v: "present", labelKey: "st.optPresent", icon: <Check className="w-3.5 h-3.5" />, cls: "bg-accent text-white border-accent" },
  { v: "half", labelKey: "st.optHalf", icon: <Minus className="w-3.5 h-3.5" />, cls: "bg-amber-500 text-white border-amber-500" },
  { v: "leave", labelKey: "st.optLeave", icon: <Palmtree className="w-3.5 h-3.5" />, cls: "bg-blue-500 text-white border-blue-500" },
  { v: "absent", labelKey: "st.optAbsent", icon: <X className="w-3.5 h-3.5" />, cls: "bg-red-500 text-white border-red-500" },
];

const statusPill = (s: AttendanceStatus) =>
  s === "present"
    ? "bg-accent/10 text-accent"
    : s === "half"
    ? "bg-amber-500/10 text-amber-500"
    : s === "leave"
    ? "bg-blue-500/10 text-blue-500"
    : "bg-red-500/10 text-red-500";

const nowHM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const currentMonth = () => new Date().toISOString().slice(0, 7);

type Tab = "daily" | "monthly" | "history";

export default function AttendancePage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("daily");
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // ---- daily ----
  const [date, setDate] = useState(todayBD());
  const [records, setRecords] = useState<Record<string, Attendance>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, AttendanceStatus>>({});
  const [timeDraft, setTimeDraft] = useState<Record<string, { inTime: string; outTime: string }>>({});

  // ---- monthly + history ----
  const [month, setMonth] = useState(currentMonth());
  const [monthData, setMonthData] = useState<Attendance[]>([]);
  const [historyStaffId, setHistoryStaffId] = useState<string>("");

  const fetchDaily = async (d: string) => {
    const [s, a]: [StaffMember[], Attendance[]] = await Promise.all([getStaff(), getAttendanceByDate(d)]);
    setStaff(s.filter((x) => x.active));
    const m: Record<string, Attendance> = {};
    const t: Record<string, { inTime: string; outTime: string }> = {};
    const st: Record<string, AttendanceStatus> = {};
    a.forEach((x) => {
      m[x.staffId] = x;
      t[x.staffId] = { inTime: x.inTime || "", outTime: x.outTime || "" };
      st[x.staffId] = x.status;
    });
    setRecords(m);
    setTimeDraft(t);
    setStatusDraft(st);
  };

  const fetchMonth = async (mo: string) => {
    const a = await getAttendanceByMonth(mo);
    setMonthData(a);
  };

  useEffect(() => {
    fetchDaily(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    fetchMonth(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, tab, date, records]);

  useEffect(() => {
    getStaff().then((s) => {
      const act = s.filter((x) => x.active);
      setStaff((prev) => (prev.length ? prev : act));
      if (!historyStaffId && act.length) setHistoryStaffId(act[0]._id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 1 (sokal): status + entry time save
  const saveEntry = async (id: string) => {
    const status = statusDraft[id] || records[id]?.status;
    if (!status) return showError(t("att.needStatus"));
    let inTime = (timeDraft[id]?.inTime || records[id]?.inTime || "").trim();
    // present/half hole entry time must, khali thakle ekhon dhore nebo
    if ((status === "present" || status === "half") && !inTime) inTime = nowHM();
    setSaving(`${id}-entry`);
    try {
      const outTime = timeDraft[id]?.outTime || records[id]?.outTime || "";
      const saved = await markAttendance(id, date, status, { inTime: status === "leave" || status === "absent" ? "" : inTime, outTime });
      setRecords((p) => ({ ...p, [id]: saved }));
      setTimeDraft((p) => ({ ...p, [id]: { inTime: saved.inTime || "", outTime: saved.outTime || "" } }));
      showSuccess(t("att.entrySaved"));
    } catch (e) {
      showError(t((e as Error).message));
    } finally {
      setSaving(null);
    }
  };

  // Step 2 (rate): exit time save
  const saveExit = async (id: string) => {
    const rec = records[id];
    if (!rec) return showError(t("att.needEntry"));
    if (rec.status === "leave" || rec.status === "absent") return showError(t("att.noExitLeave"));
    const outTime = (timeDraft[id]?.outTime || "").trim() || nowHM();
    if (rec.inTime && outTime < rec.inTime) return showError(t("att.timeOrder"));
    setSaving(`${id}-exit`);
    try {
      const saved = await updateAttendanceTimes(id, date, { outTime });
      setRecords((p) => ({ ...p, [id]: saved }));
      setTimeDraft((p) => ({ ...p, [id]: { inTime: saved.inTime || "", outTime: saved.outTime || "" } }));
      showSuccess(t("att.exitSaved"));
    } catch (e) {
      showError(t((e as Error).message));
    } finally {
      setSaving(null);
    }
  };

  const setNow = (id: string, field: "inTime" | "outTime") => {
    const val = nowHM();
    setTimeDraft((p) => ({ ...p, [id]: { inTime: p[id]?.inTime || "", outTime: p[id]?.outTime || "", [field]: val } }));
  };

  const markAllPresent = async () => {
    const pending = staff.filter((s) => !records[s._id]);
    if (!pending.length) return showError(t("att.allDone"));
    setSaving("all");
    try {
      const now = nowHM();
      for (const s of pending) {
        const saved = await markAttendance(s._id, date, "present", { inTime: now });
        setRecords((p) => ({ ...p, [s._id]: saved }));
        setStatusDraft((p) => ({ ...p, [s._id]: "present" }));
        setTimeDraft((p) => ({ ...p, [s._id]: { inTime: now, outTime: "" } }));
      }
      showSuccess(t("att.allMarked", { n: pending.length }));
    } catch (e) {
      showError(t((e as Error).message));
    } finally {
      setSaving(null);
    }
  };

  const counts = (Object.values(records) as Attendance[]).reduce((acc: Record<string, number>, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // ---- monthly summary per staff ----
  const summary = useMemo(() => {
    return staff.map((s) => {
      const mine = monthData.filter((a) => a.staffId === s._id);
      const present = mine.filter((a) => a.status === "present").length;
      const half = mine.filter((a) => a.status === "half").length;
      const leave = mine.filter((a) => a.status === "leave").length;
      const absent = mine.filter((a) => a.status === "absent").length;
      let hours = 0;
      let hourDays = 0;
      mine.forEach((a) => {
        const h = workHours(a.inTime, a.outTime);
        if (h !== null) {
          hours += h;
          hourDays += 1;
        }
      });
      return { staff: s, present, half, leave, absent, total: mine.length, hours: Math.round(hours * 10) / 10, hourDays };
    });
  }, [staff, monthData]);

  const historyList = useMemo(() => {
    return monthData
      .filter((a) => (historyStaffId ? a.staffId === historyStaffId : true))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [monthData, historyStaffId]);

  const historyStaff = staff.find((s) => s._id === historyStaffId);
  const hPresent = historyList.filter((a) => a.status === "present").length;
  const hHalf = historyList.filter((a) => a.status === "half").length;

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-xl font-black">{t("att.title")}</h2>
        <div className="flex gap-2 bg-card-bg border border-card-border rounded-md p-1">
          {(
            [
              { v: "daily", labelKey: "att.daily" },
              { v: "monthly", labelKey: "att.monthly" },
              { v: "history", labelKey: "att.history" },
            ] as { v: Tab; labelKey: string }[]
          ).map((tb) => (
            <button
              key={tb.v}
              onClick={() => setTab(tb.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-black ${tab === tb.v ? "bg-brand text-white" : "text-muted"}`}
            >
              {t(tb.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* ============ DAILY ============ */}
      {tab === "daily" && (
        <>
          <div className="flex flex-wrap gap-3 justify-between items-center mb-2">
            <p className="text-xs text-muted">
              {t("st.optPresent")}: {counts.present || 0} • {t("st.optHalf")}: {counts.half || 0} • {t("st.optLeave")}: {counts.leave || 0} • {t("st.optAbsent")}:{" "}
              {counts.absent || 0} • {t("att.entryLeft", { n: staff.length - Object.keys(records).length })}
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={markAllPresent}
                disabled={saving === "all"}
                className="px-3 py-2 rounded-md text-xs font-black bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition"
              >
                {t("att.markAll")}
              </button>
              <input
                type="date"
                value={date}
                max={todayBD()}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted mb-3 bg-card-bg border border-card-border rounded-md px-3 py-2">
            {t("att.flow")}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            {staff.map((s) => {
              const rec = records[s._id];
              const selStatus = statusDraft[s._id] || rec?.status;
              const draft = timeDraft[s._id] || { inTime: "", outTime: "" };
              const hrs = rec ? workHours(rec.inTime, rec.outTime) : null;
              const entryDone = !!rec;
              const exitDone = !!rec?.outTime;
              return (
                <div key={s._id} className="bg-card-bg border border-card-border rounded-lg p-4">
                  {/* header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-black flex items-center justify-center text-sm shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-muted">
                        {t(jobKey(s.job))} • {hrs !== null ? <span className="text-accent font-bold">{t("att.dutyDone", { h: hrs })}</span> : t("att.dutyLeft")}
                      </p>
                    </div>
                    {rec ? (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${statusPill(rec.status)}`}>
                        {t(`st.${rec.status}`)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-bg-main border border-card-border text-muted uppercase">
                        {t("att.pending")}
                      </span>
                    )}
                  </div>

                  {/* status select */}
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {OPTS.map((o) => {
                      const active = selStatus === o.v;
                      return (
                        <button
                          key={o.v}
                          onClick={() => setStatusDraft((p) => ({ ...p, [s._id]: o.v }))}
                          className={`flex items-center justify-center gap-1 py-2 rounded-md border text-[11px] font-black transition ${
                            active ? o.cls : "bg-bg-main border-card-border text-muted hover:border-brand/40"
                          }`}
                        >
                          {o.icon}
                          {t(o.labelKey)}
                        </button>
                      );
                    })}
                  </div>

                  {/* step 1 + step 2 — Chuti/Absent hole time box dekhabo na */}
                  {selStatus === "leave" || selStatus === "absent" ? (
                    <button
                      onClick={() => saveEntry(s._id)}
                      disabled={saving === `${s._id}-entry`}
                      className="w-full py-2 rounded-md text-xs font-black bg-brand text-white disabled:opacity-50"
                    >
                      {entryDone ? t("att.updateGeneric") : t("att.leaveSave")}
                    </button>
                  ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* ENTRY */}
                    <div className={`rounded-md border p-2 ${entryDone ? "border-accent/30 bg-accent/5" : "border-card-border bg-bg-main"}`}>
                      <p className="text-[10px] font-black uppercase tracking-wide text-muted mb-1.5">
                        {t("att.entry")} {entryDone && rec?.inTime ? <span className="text-accent">✓ {rec.inTime}</span> : ""}
                      </p>
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={draft.inTime}
                          onChange={(e) =>
                            setTimeDraft((p) => ({ ...p, [s._id]: { inTime: e.target.value, outTime: p[s._id]?.outTime || "" } }))
                          }
                          className="bg-card-bg border border-card-border rounded-lg px-1.5 py-1.5 text-xs font-bold outline-none w-full"
                        />
                        <button onClick={() => setNow(s._id, "inTime")} className="text-[10px] font-black text-accent px-1 shrink-0">
                          {t("att.now")}
                        </button>
                      </div>
                      <button
                        onClick={() => saveEntry(s._id)}
                        disabled={saving === `${s._id}-entry`}
                        className="mt-1.5 w-full py-1.5 rounded-lg text-[11px] font-black bg-brand text-white disabled:opacity-50"
                      >
                        {entryDone ? t("att.entryUpdate") : t("att.entrySave")}
                      </button>
                    </div>

                    {/* EXIT */}
                    <div className={`rounded-md border p-2 ${exitDone ? "border-accent/30 bg-accent/5" : "border-card-border bg-bg-main"}`}>
                      <p className="text-[10px] font-black uppercase tracking-wide text-muted mb-1.5">
                        {t("att.exit")} {exitDone ? <span className="text-accent">✓ {rec?.outTime}</span> : entryDone ? <span>{t("att.leftExit")}</span> : ""}
                      </p>
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={draft.outTime}
                          disabled={!entryDone || rec?.status === "leave" || rec?.status === "absent"}
                          onChange={(e) =>
                            setTimeDraft((p) => ({ ...p, [s._id]: { inTime: p[s._id]?.inTime || "", outTime: e.target.value } }))
                          }
                          className="bg-card-bg border border-card-border rounded-lg px-1.5 py-1.5 text-xs font-bold outline-none w-full disabled:opacity-40"
                        />
                        <button
                          onClick={() => setNow(s._id, "outTime")}
                          disabled={!entryDone}
                          className="text-[10px] font-black text-red-500 px-1 shrink-0 disabled:opacity-40"
                        >
                          {t("att.now")}
                        </button>
                      </div>
                      <button
                        onClick={() => saveExit(s._id)}
                        disabled={!entryDone || saving === `${s._id}-exit`}
                        className="mt-1.5 w-full py-1.5 rounded-lg text-[11px] font-black bg-accent text-white disabled:opacity-40"
                      >
                        {exitDone ? t("att.exitUpdate") : t("att.exitSave")}
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
          {staff.length === 0 && <p className="text-muted text-center mt-8">{t("att.noStaff")}</p>}
          <p className="text-xs text-muted mt-4 text-center">{t("att.autoNote")}</p>
        </>
      )}

      {/* ============ MONTHLY ============ */}
      {tab === "monthly" && (
        <>
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <p className="text-xs text-muted font-bold">{t("att.monthSub")}</p>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm"
            />
          </div>
          <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-bg-main text-muted text-left">
                <tr>
                  <th className="p-3">{t("att.thStaff")}</th>
                  <th className="p-3 text-center">{t("att.thPresent")}</th>
                  <th className="p-3 text-center">{t("att.thHalf")}</th>
                  <th className="p-3 text-center">{t("att.thLeave")}</th>
                  <th className="p-3 text-center">{t("att.thAbsent")}</th>
                  <th className="p-3 text-center">{t("att.thTotal")}</th>
                  <th className="p-3 text-center">{t("att.thHours")}</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.staff._id} className="border-t border-card-border">
                    <td className="p-3">
                      <p className="font-black text-text-main">{r.staff.name}</p>
                      <p className="text-[11px] text-muted">
                        {t(jobKey(r.staff.job))} • {t("att.effective", { n: r.present + r.half * 0.5 })}
                      </p>
                    </td>
                    <td className="p-3 text-center font-black text-accent">{r.present}</td>
                    <td className="p-3 text-center font-black text-amber-500">{r.half}</td>
                    <td className="p-3 text-center font-black text-blue-500">{r.leave}</td>
                    <td className="p-3 text-center font-black text-red-500">{r.absent}</td>
                    <td className="p-3 text-center font-bold">{r.total}</td>
                    <td className="p-3 text-center text-xs font-bold text-muted">
                      {r.hourDays > 0 ? `${r.hours}h / ${r.hourDays}din` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summary.length === 0 && <p className="text-center text-muted py-8 text-sm">{t("att.noStaff2")}</p>}
          </div>
          <p className="text-[11px] text-muted mt-2">{t("att.effNote")}</p>
        </>
      )}

      {/* ============ HISTORY ============ */}
      {tab === "history" && (
        <>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <select
              value={historyStaffId}
              onChange={(e) => setHistoryStaffId(e.target.value)}
              className="px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm font-bold"
            >
              {staff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {t(jobKey(s.job))}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 rounded-md border border-card-border bg-bg-main text-sm"
            />
            <span className="text-xs text-muted font-bold ml-auto">
              {t("att.histSub", { name: historyStaff?.name || "", p: hPresent, h: hHalf, n: historyList.length })}
            </span>
          </div>

          <div className="bg-card-bg border border-card-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-bg-main text-muted text-left">
                <tr>
                  <th className="p-3">{t("att.thDate")}</th>
                  <th className="p-3">{t("att.thStatus")}</th>
                  <th className="p-3">{t("att.thIn")}</th>
                  <th className="p-3">{t("att.thOut")}</th>
                  <th className="p-3">{t("att.thDuty")}</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((a) => {
                  const h = workHours(a.inTime, a.outTime);
                  return (
                    <tr key={a._id} className="border-t border-card-border">
                      <td className="p-3 font-bold">{a.date}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-black px-2 py-1 rounded-full uppercase ${statusPill(a.status)}`}>
                          {t(`st.${a.status}`)}
                        </span>
                      </td>
                      <td className="p-3 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted" />
                        {a.inTime || "—"}
                      </td>
                      <td className="p-3 font-bold">{a.outTime || "—"}</td>
                      <td className="p-3 text-xs font-bold text-muted">{h !== null ? `${h}h` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {historyList.length === 0 && <p className="text-center text-muted py-8 text-sm">{t("att.noEntry")}</p>}
          </div>
        </>
      )}
    </div>
  );
}
