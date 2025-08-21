import { useRef, useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import VizContainer from "./components/canvas/VizContainer";
import RightPanelTabs from "./components/canvas/RightPanelTabs";
import StatusStrip from "./components/canvas/StatusStrip";
import Button from "./components/ui/Button";
import { useMockStream } from "./hooks/useMockStream";
import type { Phase, FeMsg, PlotlySpec } from "./lib/types";
import { isPlotlySpec } from "./lib/types";
import type { MockController } from "./hooks/useMockStream";

type ExportType = "png" | "svg" | "pdf";

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [plotlySpec, setPlotlySpec] = useState<PlotlySpec | null>(null);
  const [preview, setPreview] = useState<{ rows: number; cols: number } | null>(
    null
  );

  // Controlled params for the right panel (later sent in the execute payload)
  const [params, setParams] = useState<{
    threshold: number;
    taxonomyLevel: string;
  }>({
    threshold: 0.1,
    taxonomyLevel: "genus",
  });

  // Export dropdown state
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!exportRef.current) return;
      if (!exportRef.current.contains(e.target as Node)) setShowExport(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Mock stream controller holder
  const controllerRef = useRef<MockController | null>(null);

  // Central handler for incoming messages
  const handleMessage = (msg: FeMsg) => {
    switch (msg.kind) {
      case "status":
        setPhase(msg.phase);
        if (typeof msg.progress === "number") setProgress(msg.progress);
        break;
      case "viz":
        setPlotlySpec(isPlotlySpec(msg.spec) ? (msg.spec as PlotlySpec) : null);
        break;
      case "table":
        setPreview(msg.preview);
        break;
      case "error":
        setPhase("error");
        toast.error(msg.message || "Error");
        break;
    }
  };

  // Initialize mock stream controller
  const { start, cancel, simulateError } = useMockStream(handleMessage);
  controllerRef.current = { start, cancel, simulateError };

  const onRun = () => {
    // Reset UI state before starting a new run
    setPhase("running");
    setProgress(5);
    setPlotlySpec(null);
    setPreview(null);

    // Later: send `params` along with templateId/binding/resources to backend
    controllerRef.current?.start();
    toast.info("Run started (mock stream).");
  };

  const onSimError = () => {
    controllerRef.current?.simulateError();
  };

  const onReset = () => {
    controllerRef.current?.cancel();
    setPhase("idle");
    setProgress(0);
    setPlotlySpec(null);
    setPreview(null);
    toast.success("Reset.");
  };

  const onExport = (type: ExportType) => {
    // Stubbed for the POC
    toast.success(`Export (${type.toUpperCase()}) - stub`);
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr,auto]">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-2xl tracking-tight">
            <span className="text-slate-900">DAP</span>{" "}
            <span className="text-slate-400">-</span>{" "}
            <span className="text-slate-700">Jupyter UI POC</span>
            <span className="ml-3 text-xs text-slate-500">(Canvas)</span>
          </h1>

          <div className="flex items-center gap-2">
            {/* Link to Notebook */}
            <a
              href="/notebook"
              className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-sm"
            >
              Open Notebook
            </a>

            <Button variant="primary" onClick={onRun}>
              Run
            </Button>
            <Button variant="danger" onClick={onSimError}>
              Simulate Error
            </Button>
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>

            {/* Export dropdown unchanged */}
            <div className="relative" ref={exportRef}>
              <Button
                variant="outline"
                aria-haspopup="menu"
                aria-expanded={showExport}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExport((s) => !s);
                }}
              >
                Export
              </Button>
              {showExport && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-slate-200 bg-white shadow-lg p-1 z-50">
                  <button
                    onClick={() => {
                      setShowExport(false);
                      onExport("png");
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50"
                  >
                    Export PNG
                  </button>
                  <button
                    onClick={() => {
                      setShowExport(false);
                      onExport("svg");
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50"
                  >
                    Export SVG
                  </button>
                  <button
                    onClick={() => {
                      setShowExport(false);
                      onExport("pdf");
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="mx-auto max-w-7xl w-full grid grid-cols-12 gap-4 p-4">
        <aside className="col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-3 py-2 font-medium">
              Cells
            </div>
            <ul className="p-2 text-sm">
              <li className="px-2 py-1 rounded hover:bg-slate-50 cursor-default">
                alpha_diversity
              </li>
              <li className="px-2 py-1 rounded hover:bg-slate-50 cursor-default">
                rarefaction
              </li>
              <li className="px-2 py-1 rounded hover:bg-slate-50 cursor-default">
                beta_diversity
              </li>
            </ul>
          </div>
        </aside>

        <section className="col-span-7">
          <VizContainer
            phase={phase}
            progress={progress}
            plotlySpec={plotlySpec}
          />
        </section>

        <aside className="col-span-3">
          <RightPanelTabs
            preview={preview}
            params={params}
            onParamsChange={(partial) =>
              setParams((p) => ({ ...p, ...partial }))
            }
          />
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <StatusStrip text={`Phase: ${phase} • Progress: ${progress}%`} />
        </div>
      </footer>

      <Toaster richColors closeButton />
    </div>
  );
}
