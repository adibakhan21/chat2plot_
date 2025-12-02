import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { ChartConfig, DataRow } from '../types';

interface ChartRendererProps {
  config: ChartConfig;
  data: DataRow[];
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ config, data }) => {
  const CommonAxis = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
      <XAxis 
        dataKey={config.xAxisKey} 
        stroke="#94a3b8" 
        tick={{ fill: '#94a3b8', fontSize: 12 }}
        tickLine={{ stroke: '#94a3b8' }}
      />
      <YAxis 
        stroke="#94a3b8" 
        tick={{ fill: '#94a3b8', fontSize: 12 }}
        tickLine={{ stroke: '#94a3b8' }}
      />
      <Tooltip 
        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
        itemStyle={{ color: '#f1f5f9' }}
      />
      <Legend wrapperStyle={{ paddingTop: '10px' }} />
    </>
  );

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CommonAxis />
            {config.series.map((s, i) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name || s.dataKey} fill={s.color || '#3b82f6'} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CommonAxis />
            {config.series.map((s, i) => (
              <Line 
                key={s.dataKey} 
                type="monotone" 
                dataKey={s.dataKey} 
                name={s.name || s.dataKey} 
                stroke={s.color || '#3b82f6'} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: s.color || '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CommonAxis />
            {config.series.map((s, i) => (
              <Area 
                key={s.dataKey} 
                type="monotone" 
                dataKey={s.dataKey} 
                name={s.name || s.dataKey} 
                fill={s.color || '#3b82f6'} 
                stroke={s.color || '#3b82f6'} 
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
      case 'scatter':
        return (
          <ScatterChart data={data}>
             <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
             <XAxis 
                dataKey={config.xAxisKey} 
                type="number" 
                name={config.xAxisKey} 
                stroke="#94a3b8" 
             />
             <YAxis 
                dataKey={config.series[0].dataKey} 
                type="number" 
                name={config.series[0].name} 
                stroke="#94a3b8"
             />
             <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
             <Legend />
             <Scatter name={config.series[0].name} data={data} fill={config.series[0].color || '#3b82f6'} />
          </ScatterChart>
        );
      case 'pie':
        // Pie charts typically handle one data series
        const s = config.series[0];
        const COLORS = config.series.map(ser => ser.color || '#3b82f6');
        // If specific colors aren't provided, we generate a palette
        const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

        return (
           <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={s.dataKey}
              nameKey={config.xAxisKey} // usually the category
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
            <Legend />
          </PieChart>
        );
      default:
        return <div className="text-gray-400">Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg border border-slate-700 p-4 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">{config.title || 'Data Visualization'}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
