import React from 'react';

const getColor = (val) => {
  if (val >= 80) return { stroke: '#16a34a', text: '#16a34a', bg: '#dcfce7', label: 'Excellent' };
  if (val >= 60) return { stroke: '#2563eb', text: '#2563eb', bg: '#dbeafe', label: 'Good' };
  if (val >= 40) return { stroke: '#f59e0b', text: '#d97706', bg: '#fef9c3', label: 'Moderate' };
  return { stroke: '#ef4444', text: '#dc2626', bg: '#fee2e2', label: 'Poor' };
};

const POAchievementGauge = ({ poAchievement = 0, coPOPenalty = 0 }) => {
  const v = Math.max(0, Math.min(100, Number(poAchievement || 0)));
  const colors = getColor(v);

  const R = 72;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - v / 100);

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        PO Achievement
      </h4>
      <div className="relative">
        <svg width={200} height={200} viewBox="0 0 200 200">
          {/* Track */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f0f0f0" strokeWidth={16} />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          {/* Center value */}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={26} fontWeight={800} fill={colors.text}>
            {v.toFixed(1)}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fontWeight={600} fill="#9ca3af">
            Achievement
          </text>
          <text x={cx} y={cy + 30} textAnchor="middle" fontSize={10} fill={colors.text} fontWeight={700}>
            {colors.label}
          </text>
        </svg>
      </div>
      {/* Penalty badge */}
      <div className="mt-3 px-4 py-2 rounded-xl border text-center" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">CO-PO Penalty</div>
        <div className="text-lg font-bold text-red-500">{Number(coPOPenalty).toFixed(2)}%</div>
      </div>
    </div>
  );
};

export default POAchievementGauge;