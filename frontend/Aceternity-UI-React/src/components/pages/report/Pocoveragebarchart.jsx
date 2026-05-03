import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, LabelList
} from 'recharts';

const getColor = (val) => {
  if (val >= 80) return '#16a34a';
  if (val >= 60) return '#2563eb';
  if (val >= 40) return '#f59e0b';
  return '#ef4444';
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const color = getColor(value);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="font-semibold text-gray-800 mb-1">{name}</div>
      <div style={{ color }} className="font-bold text-base">{value.toFixed(1)}%</div>
      <div className="text-gray-400 text-xs mt-0.5">
        {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : value >= 40 ? 'Moderate' : 'Poor'}
      </div>
    </div>
  );
};

const POCoverageBarChart = ({ poCoverage = {} }) => {
  const chartData = Object.entries(poCoverage).map(([po, val]) => ({
    name: po,
    value: typeof val === 'number' ? parseFloat(val.toFixed(2)) : 0,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        PO Coverage
      </h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: '80%', position: 'right', fontSize: 9, fill: '#16a34a' }} />
          <ReferenceLine y={60} stroke="#2563eb" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: '60%', position: 'right', fontSize: 9, fill: '#2563eb' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.value)} fillOpacity={0.88} />
            ))}
            <LabelList dataKey="value" position="top"
              formatter={(v) => `${v.toFixed(1)}%`}
              style={{ fontSize: 10, fontWeight: 700, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default POCoverageBarChart;