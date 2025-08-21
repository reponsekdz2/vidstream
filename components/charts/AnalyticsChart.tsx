import React from 'react';

interface ChartData {
  date: string;
  [key: string]: any;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartData[];
  dataKey: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, data, dataKey }) => {
  const width = 500;
  const height = 250;
  const padding = 40;

  const maxValue = Math.max(...data.map(d => d[dataKey]));
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000; // Round up to nearest 1000

  const toPath = (points: [number, number][]) => {
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }
    return d;
  };

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d[dataKey] / yAxisMax) * (height - 2 * padding);
    return [x, y] as [number, number];
  });
  
  const yAxisLabels = [0, yAxisMax/2, yAxisMax];

  return (
    <div className="bg-dark-surface p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-Axis lines and labels */}
        {yAxisLabels.map((label, i) => {
          const y = height - padding - (label / yAxisMax) * (height - 2 * padding);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#383838" strokeDasharray="2" />
              <text x={padding - 10} y={y + 5} fill="#e5e5e5" fontSize="10" textAnchor="end">
                {label/1000}k
              </text>
            </g>
          );
        })}

        {/* X-Axis labels */}
        <text x={padding} y={height - padding + 20} fill="#e5e5e5" fontSize="10" textAnchor="start">
          {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        <text x={width-padding} y={height-padding+20} fill="#e5e5e5" fontSize="10" textAnchor="end">
            {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
        
        {/* Data Line */}
        <path d={toPath(points)} fill="none" stroke="#E50914" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default AnalyticsChart;