import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

interface TaxaPayload {
  samples: string[];
  taxa: { name: string; values: number[] }[];
}

export const BarChart: React.FC = () => {
  const [data, setData] = useState<TaxaPayload | null>(null);

  useEffect(() => {
    fetch("/data/taxa_topN.json")
      .then((res) => res.json())
      .then((json: TaxaPayload) => setData(json))
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  if (!data) return <p>Loading...</p>;

  // Example: aggregate totals for each taxa across samples
  const taxonNames = data.taxa.map((t) => t.name);
  const totals = data.taxa.map((t) => t.values.reduce((sum, v) => sum + v, 0));

  return (
    <Plot
      data={[
        {
          x: taxonNames,
          y: totals,
          type: "bar",
          marker: { color: "steelblue" },
        },
      ]}
      layout={{
        title: { text: "Abundance Bar Chart" },
        xaxis: { title: { text: "Taxa" } },
        yaxis: { title: { text: "Total Abundance" } },
        autosize: true,
        height: 500,
      }}
      config={{ responsive: true }}
    />
  );
};
