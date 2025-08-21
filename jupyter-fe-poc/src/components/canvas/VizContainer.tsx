import { useEffect, useRef } from "react";
import type { Phase, PlotlySpec } from "../../lib/types";
import Plotly from "plotly.js-dist-min";

type Props = {
  phase: Phase;
  progress?: number;
  plotlySpec?: PlotlySpec | null;
};

export default function VizContainer({ phase, progress, plotlySpec }: Props) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    if (plotlySpec?.library === "plotly") {
      const { data, layout, config } = plotlySpec;
      Plotly.newPlot(el, data, layout, config);
      const handle = () => Plotly.Plots.resize(el);
      window.addEventListener("resize", handle);
      return () => {
        window.removeEventListener("resize", handle);
        Plotly.purge(el);
      };
    } else {
      el.innerHTML = "";
    }
  }, [plotlySpec]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium text-slate-800">Visualization</h2>
        <span className="text-xs text-slate-500">Center panel</span>
      </div>

      {(phase === "running" || phase === "processing") && (
        <div className="h-1 w-full bg-slate-100 rounded mb-2 overflow-hidden">
          <div
            className="h-1 bg-indigo-600 transition-[width] duration-300"
            style={{ width: `${progress ?? 10}%` }}
          />
        </div>
      )}

      <div className="h-[420px] rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-2">
        <div ref={divRef} className="h-full w-full" />

        {!plotlySpec && (
          <div className="grid place-items-center h-full -mt-[420px] pointer-events-none">
            <div className="text-center text-sm text-slate-600 px-6">
              <p className="font-medium mb-1">No chart yet</p>
              <p>
                Click <span className="font-semibold">Run</span> to simulate a
                workflow (the mock stream will provide a Plotly spec).
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Current phase: <code>{phase}</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
