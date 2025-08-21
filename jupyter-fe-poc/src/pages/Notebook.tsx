import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import Button from "../components/ui/Button";
import RightPanelTabs from "../components/canvas/RightPanelTabs";
import StatusStrip from "../components/canvas/StatusStrip";
import { useColabExports } from "../lib/useColabExports";
import { useMockStream, type MockController } from "../hooks/useMockStream";
import type { FeMsg, Phase, PlotlySpec } from "../lib/types";
import { isPlotlySpec } from "../lib/types";
import NotebookGallery from "./notebook/NotebookGallery";

export default function Notebook() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [preview, setPreview] = useState<{ rows: number; cols: number } | null>(
    null
  );
  const [liveSpec, setLiveSpec] = useState<PlotlySpec | null>(null);

  // Colab exports state
  const { state, refresh } = useColabExports("/colab-exports");

  // Mock stream (status/table/viz/error)
  const controllerRef = useRef<MockController | null>(null);
  const onMessage = (msg: FeMsg) => {
    switch (msg.kind) {
      case "status":
        setPhase(msg.phase);
        if (typeof msg.progress === "number") setProgress(msg.progress);
        break;
      case "table":
        setPreview(msg.preview);
        break;
      case "viz":
        setLiveSpec(isPlotlySpec(msg.spec) ? (msg.spec as PlotlySpec) : null);
        break;
      case "error":
        setPhase("error");
        toast.error(msg.message || "Error");
        break;
    }
  };
  const { start, cancel, simulateError } = useMockStream(onMessage);
  controllerRef.current = { start, cancel, simulateError };

  useEffect(() => {
    // При успешно refresh от Colab — визуализирай preview от файловете
    if (state.preview) setPreview(state.preview);
  }, [state.preview]);

  const onRun = () => {
    setPhase("running");
    setProgress(5);
    setLiveSpec(null);
    setPreview(null);
    controllerRef.current?.start();
    toast.info("Run started (mock stream).");
  };

  const onSimError = () => controllerRef.current?.simulateError();

  const onReset = () => {
    controllerRef.current?.cancel();
    setPhase("idle");
    setProgress(0);
    setLiveSpec(null);
    // Оставяме preview от Colab да си остане, не го чистим
    toast.success("Reset.");
  };

  const handleRefresh = async () => {
    await refresh();
    toast.success("Refreshed from /colab-exports.");
  };

  const openColab = () => {
    window.open(
      "https://colab.research.google.com/",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const viewExports = () => {
    // Отвори най-често използваните файлове в нови табове (ако ги има)
    const files = [
      "/colab-exports/manifest.json",
      "/colab-exports/table_preview.json",
      "/colab-exports/heatmap.json",
      "/colab-exports/heatmap.png",
      "/colab-exports/stacked_bar.json",
      "/colab-exports/stacked_bar.png",
      "/colab-exports/boxplot.json",
      "/colab-exports/boxplot.png",
    ];
    files.forEach((f) => window.open(f, "_blank"));
  };

  const onExport = (type: "png" | "svg" | "pdf") => {
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
            <span className="text-slate-700">Notebook</span>
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={openColab}>
              Open in Colab
            </Button>
            <Button variant="secondary" onClick={handleRefresh}>
              Refresh from Notebook
            </Button>
            <Button variant="secondary" onClick={viewExports}>
              View Exports
            </Button>
            <div className="w-px h-6 bg-slate-300 mx-1" />
            <Button variant="primary" onClick={onRun}>
              Run
            </Button>
            <Button variant="danger" onClick={onSimError}>
              Simulate Error
            </Button>
            <Button variant="outline" onClick={onReset}>
              Reset
            </Button>
            <div className="relative">
              <Button variant="outline" onClick={() => onExport("png")}>
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
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

          {/* Progress */}
          {(phase === "running" || phase === "processing") && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm p-3">
              <p className="text-sm font-medium mb-2">Progress</p>
              <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-2 bg-indigo-600 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Phase: {phase} • {progress}%
              </p>
            </div>
          )}
        </aside>

        <section className="col-span-7">
          <NotebookGallery
            liveSpec={liveSpec}
            heatmap={state.figures.heatmap}
            stackedBar={state.figures.stacked_bar}
            boxplot={state.figures.boxplot}
          />
        </section>

        <aside className="col-span-3">
          <RightPanelTabs
            preview={preview}
            params={{ threshold: 0.1, taxonomyLevel: "genus" }}
            onParamsChange={() => {}}
          />
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <StatusStrip
            text={`Streaming via mock; real WS/SSE later • Phase: ${phase} • Progress: ${progress}%`}
          />
        </div>
      </footer>

      <Toaster richColors closeButton />
    </div>
  );
}
