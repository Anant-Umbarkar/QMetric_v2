import React, { useRef } from 'react';
import BloomsAnalysisChart from './report/BloomAnalysisChart';
import ModuleAnalysisChart from './report/ModuleAnalysisChart';
import QuestionDistributionChart from './report/QuestionDistributionChart';
import COCoverageChart from './report/COCoverageChart';
import POAchievementGauge from './report/Poachievementgauge';
import POCoverageBarChart from './report/Pocoveragebarchart';
import COPOHeatmapChart from './report/Copoheatmapchart';
import COPOGroupedBarChart from './report/Copogroupedbarchart';

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export const Gauge = ({ value = 0, size = 220 }) => {
  const v = Math.max(0, Math.min(100, Number(value || 0)));
  const width = size + 60;
  const height = Math.round(size / 2) + 80;
  const cx = (size + 60) / 2;
  const cy = size / 2 + 35;
  const r = Math.max(10, size / 2 - 24);
  const startAngle = -90;
  const maxAngle = 90;
  const currentAngle = startAngle + (v / 100) * (maxAngle - startAngle);
  const getColorForPercentage = (p) =>
    p >= 80 ? '#16a34a' : p >= 60 ? '#2563eb' : p >= 40 ? '#f59e0b' : '#ef4444';
  const bgPath = describeArc(cx, cy, r, startAngle, maxAngle);
  const fgPath = describeArc(cx, cy, r, startAngle, currentAngle);
  const needlePt = polarToCartesian(cx, cy, r - 6, currentAngle);
  const color = v >= 80 ? '#16a34a' : v >= 60 ? '#2563eb' : v >= 40 ? '#f59e0b' : '#ef4444';
  const scaleLabels = [];
  for (let i = 0; i <= 10; i++) {
    const pct = i * 10;
    const angle = startAngle + (pct / 100) * (maxAngle - startAngle);
    const pos = polarToCartesian(cx, cy, r + 42, angle);
    scaleLabels.push({ pct, x: pos.x, y: pos.y, color: getColorForPercentage(pct) });
  }

  return (
    <div className="inline-block">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <path d={bgPath} fill="none" stroke="url(#gaugeGradient)" strokeWidth="18" strokeLinecap="round" />
        <path d={fgPath} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" opacity="0.7" />
        {scaleLabels.map(l => (
          <text key={l.pct} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="12" fontWeight="600" fill={l.color} className="pointer-events-none">
            {l.pct}
          </text>
        ))}
        <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y} stroke="#222" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#222" />
      </svg>
      <div className="mt-2 text-center">
        <div className="text-4xl font-bold text-blue-600">{v.toFixed(1)}%</div>
        <div className="text-sm text-gray-700">Overall Assessment Score</div>
      </div>
    </div>
  );
};

const VisualizationModal = ({
  show,
  onClose,
  finalScore,
  bloomsData,
  moduleData,
  coRecommendations,
  coData,
  coKeys,
  poKeys,
  poCoverage,
  coPOCoverage,
  coPOPenalty,
  poAchievement,
  questionData,
}) => {
  const chartsRef = useRef(null);

  const printCharts = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      const content = chartsRef.current ? chartsRef.current.innerHTML : '<p>No charts available</p>';
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Graphical Report</title>
        <style>body{font-family:Arial,sans-serif;padding:20px;color:#111}.chart-container{max-width:900px;margin:0 auto}</style>
        </head><body><h1 style="text-align:center">Graphical Report</h1>
        <div class="chart-container">${content}</div></body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    } catch (err) {
      console.error('Print charts failed', err);
      alert('Printing charts failed');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto p-6 mx-4 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Graphical Report</h3>
          <div className="flex items-center gap-2">
            <button onClick={printCharts} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Print Charts</button>
            <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Close</button>
          </div>
        </div>
        <div ref={chartsRef} className="space-y-6">
          <div className="flex justify-center"><Gauge value={finalScore} size={240} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BloomsAnalysisChart bloomsData={bloomsData} />
            <ModuleAnalysisChart moduleData={moduleData} />
          </div>
          <div className="mt-6"><COCoverageChart coRecommendations={coRecommendations} coData={coData} /></div>

          {poKeys.length > 0 && (
            <div className="space-y-6 border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">PO Analysis</h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {poAchievement !== null && (
                  <POAchievementGauge poAchievement={poAchievement} coPOPenalty={coPOPenalty} />
                )}
                <POCoverageBarChart poCoverage={poCoverage} />
              </div>
              <COPOHeatmapChart coPOCoverage={coPOCoverage} coKeys={coKeys} poKeys={poKeys} />
              <COPOGroupedBarChart coPOCoverage={coPOCoverage} coKeys={coKeys} poKeys={poKeys} />
            </div>
          )}

          <QuestionDistributionChart questionData={questionData} />
        </div>
      </div>
    </div>
  );
};

export default VisualizationModal;
