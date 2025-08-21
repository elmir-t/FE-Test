import Plot from "react-plotly.js";
import type { PlotlySpec } from "../../lib/types";

type FigureSlot = { spec?: PlotlySpec; imageUrl?: string };
type Props = {
  liveSpec: PlotlySpec | null;
  heatmap: FigureSlot;
  stackedBar: FigureSlot;
  boxplot: FigureSlot;
};

function Card({
  title,
  figure,
  height = 360,
}: {
  title: string;
  figure: FigureSlot;
  height?: number;
}) {
  const { spec, imageUrl } = figure;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-800">{title}</h3>
      </div>
      <div className="border border-dashed border-slate-300 rounded-md bg-slate-50/50 p-2">
        {spec ? (
          <Plot
            data={spec.data as any}
            layout={{ ...spec.layout, height }}
            config={{ ...spec.config, responsive: true, displayModeBar: false }}
            style={{ width: "100%", height }}
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{ height }}
            className="grid place-items-center text-xs text-slate-500"
          >
            No data. Click “Refresh from Notebook” after copying exports.
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotebookGallery({
  liveSpec,
  heatmap,
  stackedBar,
  boxplot,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Live (mock) viz spec from stream, optional */}
      {liveSpec && (
        <Card
          title="Live (mock) viz"
          figure={{ spec: liveSpec }}
          height={320}
        />
      )}

      <Card title="Heatmap (from Colab export)" figure={heatmap} />
      <Card title="Stacked Bar (from Colab export)" figure={stackedBar} />
      <Card title="Boxplot (from Colab export)" figure={boxplot} />
    </div>
  );
}
