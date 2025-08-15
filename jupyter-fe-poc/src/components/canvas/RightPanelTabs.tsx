import { useState } from "react";

type Tab = "Params" | "Data" | "AI";
type Params = { threshold: number; taxonomyLevel: string };

export default function RightPanelTabs({
  preview,
  params,
  onParamsChange,
}: {
  preview: { rows: number; cols: number } | null;
  params?: Params; // optional for safety
  onParamsChange?: (partial: Partial<Params>) => void; // optional
}) {
  const [tab, setTab] = useState<Tab>("Params");

  // Safe fallbacks if parent didn’t pass props yet
  const safeParams: Params = params ?? {
    threshold: 0.1,
    taxonomyLevel: "genus",
  };
  const emit = onParamsChange ?? (() => {});

  const btnBase =
    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full grid grid-rows-[auto,1fr]">
      <div className="border-b border-slate-200 px-2 py-1 overflow-hidden">
        <div className="flex gap-2">
          {(["Params", "Data", "AI"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  active
                    ? `${btnBase} bg-slate-900 text-white border-slate-900 shadow-sm`
                    : `${btnBase} bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300`
                }
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 overflow-auto text-sm">
        {tab === "Params" && (
          <form className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Threshold
              </label>
              <input
                className="w-full rounded-md border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                step="0.1"
                value={safeParams.threshold}
                onChange={(e) =>
                  emit({ threshold: parseFloat(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Taxonomy level
              </label>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={safeParams.taxonomyLevel}
                onChange={(e) => emit({ taxonomyLevel: e.target.value })}
              >
                <option>genus</option>
                <option>species</option>
                <option>family</option>
              </select>
            </div>

            <p className="text-xs text-slate-500">
              Placeholder controls; wiring comes next.
            </p>
          </form>
        )}

        {tab === "Data" && (
          <div className="space-y-1">
            <p>
              Data source:{" "}
              <span className="font-medium">Unilever demo (placeholder)</span>
            </p>
            <p className="text-xs text-slate-500">
              Preview:{" "}
              {preview ? (
                <span className="font-medium">
                  {preview.rows.toLocaleString()} rows ×{" "}
                  {preview.cols.toLocaleString()} cols
                </span>
              ) : (
                "-"
              )}
            </p>
          </div>
        )}

        {tab === "AI" && (
          <div>
            <p className="font-medium">AI assistant (placeholder)</p>
            <p className="text-xs text-slate-500">
              Reserved for prompts/suggestions in future iterations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
