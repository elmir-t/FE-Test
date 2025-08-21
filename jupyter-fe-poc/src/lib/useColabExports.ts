import { useCallback, useState } from "react";
import type { PlotlySpec } from "./types";

export type ColabVizName = "heatmap" | "stacked_bar" | "boxplot";
type FigureSlot = { spec?: PlotlySpec; imageUrl?: string };

export function isPlotlySpecLike(x: any): x is PlotlySpec {
  return !!x && x.library === "plotly" && Array.isArray(x.data);
}

type State = {
  loading: boolean;
  updatedAt: number | null;
  preview: { rows: number; cols: number } | null;
  figures: Record<ColabVizName, FigureSlot>;
  errors: string[];
};

const INITIAL_STATE: State = {
  loading: false,
  updatedAt: null,
  preview: null,
  figures: {
    heatmap: {},
    stacked_bar: {},
    boxplot: {},
  },
  errors: [],
};

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function addCacheBust(url: string) {
  return `${url}?t=${Date.now()}`;
}

export function useColabExports(base = "/colab-exports") {
  const [state, setState] = useState<State>(INITIAL_STATE);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, errors: [] }));

    // 1) table preview
    const preview = await fetchJSON<{ rows: number; cols: number }>(
      `${base}/table_preview.json`
    );

    const names: ColabVizName[] = ["heatmap", "stacked_bar", "boxplot"];
    const figures: Record<ColabVizName, FigureSlot> = {
      heatmap: {},
      stacked_bar: {},
      boxplot: {},
    };

    for (const name of names) {
      const json = await fetchJSON<any>(`${base}/${name}.json`);
      if (json && isPlotlySpecLike(json)) {
        figures[name] = { spec: json as PlotlySpec };
      } else {
        // PNG fallback
        figures[name] = { imageUrl: addCacheBust(`${base}/${name}.png`) };
      }
    }

    setState({
      loading: false,
      updatedAt: Date.now(),
      preview: preview ?? null,
      figures,
      errors: [],
    });
  }, [base]);

  return { state, refresh };
}
