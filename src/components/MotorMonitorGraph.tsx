import { Axis } from "plotly.js";
import { useRef, useState } from "react";
import Plot, { Figure } from "react-plotly.js";
import { useSerialLineEvent } from "../lib/useSerialLineEvent";

const MAX_POINTS = 100;
const X_SCALE = new Array(MAX_POINTS).fill(0).map((x, i) => i);

const COLORS = ["red", "green", "blue", "orange", "pink"];

export const MotorMonitorGraph = ({ motorKey }: { motorKey: string }) => {
  const metrics = useRef([] as { name: string; data: number[] }[]);
  const [revision, setRevision] = useState(0);
  const [axisZooms, setAxisZooms] = useState({
    xaxis: undefined as undefined | number[],
    yaxis: [] as (undefined | number[])[],
  });

  useSerialLineEvent((line) => {
    if (line.content.startsWith(`${motorKey}M`)) {
      const points = line.content.slice(2).split("\t").map(Number);
      points.forEach((point, i) => {
        if (!metrics.current[i]) {
          metrics.current[i] = {
            name: i.toString(),
            data: [],
          };
        }
        metrics.current[i].data.push(point);
        if (metrics.current[i].data.length > MAX_POINTS) {
          metrics.current[i].data.splice(
            0,
            metrics.current[i].data.length - MAX_POINTS
          );
        }
      });
      setRevision((r) => r + 1);
    }
  });

  const handleGraphUpdate = (update: Readonly<Figure>) => {
    let newZoom: typeof axisZooms = {
      xaxis: update.layout.xaxis?.autorange
        ? undefined
        : update.layout.xaxis?.range,
      yaxis: [],
    };

    let hasChanged = axisZooms.xaxis !== newZoom.xaxis;

    metrics.current.map((m, i) => {
      const yAxis = (update.layout as any)[
        `yaxis${i === 0 ? "" : i + 1}`
      ] as Partial<Axis>;

      const zoom = yAxis?.autorange ? undefined : yAxis?.range;
      newZoom.yaxis.push(zoom);
      if (zoom !== axisZooms.yaxis[i]) {
        hasChanged = true;
      }
    });

    if (hasChanged) {
      setAxisZooms(newZoom);
    }
  };

  const axisData = {
    xaxis: {
      autoRange: axisZooms.xaxis,
    },
  } as any;
  metrics.current.forEach((m, i) => {
    const range = axisZooms.yaxis[i];
    axisData[`yaxis${i === 0 ? "" : i + 1}`] = {
      autoRange: !range,
      range: range,
      tickfront: {
        color: COLORS[i],
      },
      titlefont: {
        color: COLORS[i],
      },
      // position: i * 0.1,
      side: i % 2 ? "left" : "right",
      // anchor: "free",
      // overlaying: "y",
      title: `Trace ${i}`,
    };
  });

  return (
    <div>
      <Plot
        revision={revision}
        data={metrics.current.map((metric, i) => ({
          x: X_SCALE,
          y: metric.data,
          type: "scattergl",
          mode: "lines",
          yaxis: `y${i === 0 ? "" : i + 1}`,
          line: {
            color: COLORS[i],
          },
        }))}
        layout={{
          autosize: true,
          height: 400,
          datarevision: revision,
          ...axisData,
        }}
        onUpdate={handleGraphUpdate}
        useResizeHandler
        style={{
          width: "100%",
        }}
      />
    </div>
  );
};
