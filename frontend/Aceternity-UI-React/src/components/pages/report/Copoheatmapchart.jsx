import React, { useState } from 'react';

const getColor = (val) => {
  if (val === null || val === undefined) return { bg: '#f3f4f6', text: '#d1d5db', border: '#e5e7eb', isNull: true };
  if (val >= 80) return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
  if (val >= 60) return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
  if (val >= 40) return { bg: '#fef9c3', text: '#a16207', border: '#fde047' };
  return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
};

const COPOHeatmapChart = ({ coPOCoverage = {}, coKeys = [], poKeys = [] }) => {
  const [tooltip, setTooltip] = useState({ visible: false, co: '', po: '', val: null, x: 0, y: 0 });

  if (coKeys.length === 0 || poKeys.length === 0) return null;

  const CELL_W = Math.max(56, Math.min(90, Math.floor(480 / poKeys.length)));
  const CELL_H = 42;
  const LABEL_W = 60;
  const HEADER_H = 34;
  const totalW = LABEL_W + poKeys.length * CELL_W;
  const totalH = HEADER_H + coKeys.length * CELL_H;

  return (
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        CO-PO Mapping Coverage — Heatmap
      </h4>
      <div className="overflow-x-auto relative">
        <svg
          width={totalW} height={totalH}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
        >
          {poKeys.map((po, j) => (
            <text key={po}
              x={LABEL_W + j * CELL_W + CELL_W / 2} y={HEADER_H / 2 + 5}
              textAnchor="middle" fontSize={10} fontWeight={700} fill="#6b7280">
              {po}
            </text>
          ))}
          {coKeys.map((co, i) => {
            const coverageRow = coPOCoverage[co] || {};
            const y = HEADER_H + i * CELL_H;
            return (
              <g key={co}>
                <text x={LABEL_W - 8} y={y + CELL_H / 2 + 4}
                  textAnchor="end" fontSize={10} fontWeight={700} fill="#7c3aed">{co}</text>
                {poKeys.map((po, j) => {
                  const val = coverageRow[po] ?? null;
                  const colors = getColor(val);
                  const cx = LABEL_W + j * CELL_W;
                  return (
                    <g key={po}
                      onMouseEnter={(e) => {
                        const svgEl = e.currentTarget.closest('svg');
                        const rect = svgEl.getBoundingClientRect();
                        setTooltip({ visible: true, co, po, val,
                          x: e.clientX - rect.left, y: e.clientY - rect.top });
                      }}
                      style={{ cursor: 'default' }}>
                      <rect x={cx + 3} y={y + 4} width={CELL_W - 6} height={CELL_H - 8}
                        rx={6} fill={colors.bg} stroke={colors.border} strokeWidth={1} />
                      <text x={cx + CELL_W / 2} y={y + CELL_H / 2 + 4}
                        textAnchor="middle"
                        fontSize={colors.isNull ? 13 : 10}
                        fontWeight={colors.isNull ? 400 : 700}
                        fill={colors.text}>
                        {colors.isNull ? '-' : val.toFixed(0) + '%'}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        {tooltip.visible && (
          <div className="absolute z-50 pointer-events-none bg-white border border-gray-200 rounded-xl shadow-xl px-3 py-2 text-xs whitespace-nowrap"
            style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}>
            <div className="font-semibold text-gray-800 mb-0.5">{tooltip.co} to {tooltip.po}</div>
            {tooltip.val === null ? (
              <div className="text-gray-400">No mapping defined</div>
            ) : (
              <div style={{ color: getColor(tooltip.val).text }} className="font-bold text-sm">
                {tooltip.val.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 justify-center">
        {[
          { bg: '#dcfce7', border: '#86efac', text: '#15803d', label: '>=80%' },
          { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', label: '>=60%' },
          { bg: '#fef9c3', border: '#fde047', text: '#a16207', label: '>=40%' },
          { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', label: '<40%' },
          { bg: '#f3f4f6', border: '#e5e7eb', text: '#9ca3af', label: 'No map' },
        ].map(({ bg, border, text, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span style={{ background: bg, border: '1px solid ' + border }} className="inline-block w-3 h-3 rounded-sm" />
            <span style={{ color: text }} className="font-semibold">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default COPOHeatmapChart;