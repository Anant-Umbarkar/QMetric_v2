import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

// Generate a distinct color palette for POs
const PO_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16', '#06b6d4', '#a855f7',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <div className="font-bold text-gray-800 mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span style={{ background: p.fill }} className="inline-block w-2.5 h-2.5 rounded-sm" />
          <span className="text-gray-600">{p.dataKey}:</span>
          <span style={{ color: p.fill }} className="font-bold">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

const COPOGroupedBarChart = ({ coPOCoverage = {}, coKeys = [], poKeys = [] }) => {
  if (coKeys.length === 0 || poKeys.length === 0) return null;

  const chartData = coKeys.map((co) => {
    const row = coPOCoverage[co] || {};
    const entry = { co };
    poKeys.forEach((po) => {
      entry[po] = row[po] ?? 0;
    });
    return entry;
  });

  return (
    <div className="w-full">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        CO-PO Coverage per CO — Grouped Bar
      </h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 5 }} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="co" tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: '#6b7280', fontWeight: 600 }}>{value}</span>}
          />
          <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 3" strokeWidth={1.2}
            label={{ value: '80%', position: 'right', fontSize: 9, fill: '#16a34a' }} />
          <ReferenceLine y={60} stroke="#2563eb" strokeDasharray="4 3" strokeWidth={1.2}
            label={{ value: '60%', position: 'right', fontSize: 9, fill: '#2563eb' }} />
          {poKeys.map((po, i) => (
            <Bar key={po} dataKey={po} fill={PO_COLORS[i % PO_COLORS.length]}
              radius={[4, 4, 0, 0]} maxBarSize={20} fillOpacity={0.85} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default COPOGroupedBarChart;