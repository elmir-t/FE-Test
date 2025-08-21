import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

interface TaxaPayload {
  samples: string[];
  taxa: { name: string; values: number[] }[];
}

export const HeatmapChart: React.FC = () => {
  const [data, setData] = useState<TaxaPayload | null>(null);

  useEffect(() => {
    fetch("/data/taxa_topN.json")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  if (!data) return <div>Loading heatmap...</div>;

  return (
    <Plot
      data={[
        {
          z: data.taxa.map((t) => t.values), // matrix
          x: data.samples, // sample names
          y: data.taxa.map((t) => t.name), // taxa names
          type: "heatmap",
          colorscale: "Viridis",
        },
      ]}
      layout={{
        title: { text: "Taxa Heatmap" },
        xaxis: { title: { text: "Samples" } },
        yaxis: { title: { text: "Taxa" } },
        autosize: true,
        height: 600,
      }}
      style={{ width: "100%", height: "100%" }}
      config={{ responsive: true }}
    />
  );
};
