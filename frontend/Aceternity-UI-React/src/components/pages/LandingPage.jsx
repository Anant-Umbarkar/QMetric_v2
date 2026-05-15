import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, BarChart3, ArrowRight, Eye, Target, BookOpen, Brain, GitMerge } from 'lucide-react';

const PYRAMID_LEVELS = [
  { label: 'Create',     sub: 'Design · Construct · Produce',    color: '#a855f7' },
  { label: 'Evaluate',   sub: 'Justify · Critique · Assess',     color: '#7c3aed' },
  { label: 'Analyse',    sub: 'Differentiate · Organise',        color: '#4f46e5' },
  { label: 'Apply',      sub: 'Execute · Implement · Use',       color: '#2563eb' },
  { label: 'Understand', sub: 'Explain · Classify · Compare',    color: '#0284c7' },
  { label: 'Remember',   sub: 'Recall · List · Identify',        color: '#0891b2' },
];

function BloomsPyramid() {
  const [hovered, setHovered] = useState(null);

  const SVG_W   = 900;
  const CX      = SVG_W / 2;
  const LEVEL_H = 96;
  const GAP     = 6;
  const BASE_W  = 860;
  const TOP_W   = 140;
  const TOTAL   = PYRAMID_LEVELS.length;
  const TOP_Y   = 40;

  const totalSvgH = TOP_Y + TOTAL * (LEVEL_H + GAP) + 50;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${totalSvgH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Bloom's Taxonomy pyramid"
      style={{ display: 'block' }}
    >
      <defs>
        {PYRAMID_LEVELS.map((lv, i) => (
          <React.Fragment key={i}>
            {/* Normal gradient */}
            <linearGradient id={`lgrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={lv.color} stopOpacity="0.06" />
              <stop offset="35%"  stopColor={lv.color} stopOpacity="0.32" />
              <stop offset="65%"  stopColor={lv.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={lv.color} stopOpacity="0.06" />
            </linearGradient>

            {/* Hovered gradient — stronger */}
            <linearGradient id={`lgradH${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={lv.color} stopOpacity="0.14" />
              <stop offset="35%"  stopColor={lv.color} stopOpacity="0.62" />
              <stop offset="65%"  stopColor={lv.color} stopOpacity="0.62" />
              <stop offset="100%" stopColor={lv.color} stopOpacity="0.14" />
            </linearGradient>

            {/* Shimmer line gradient */}
            <linearGradient id={`lgradS${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={lv.color} stopOpacity="0" />
              <stop offset="50%"  stopColor={lv.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={lv.color} stopOpacity="0" />
            </linearGradient>
          </React.Fragment>
        ))}

        {/* Left-edge fade */}
        <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="black" stopOpacity="1" />
          <stop offset="32%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        {/* Top edge fade */}
        <linearGradient id="topFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor="black" stopOpacity="1" />
          <stop offset="15%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        {/* Bottom edge fade */}
        <linearGradient id="botFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="82%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="1" />
        </linearGradient>

        <mask id="pyramidMask">
          <rect width={SVG_W} height={totalSvgH} fill="white" />
          <rect width={SVG_W} height={totalSvgH} fill="url(#leftFade)" />
          <rect width={SVG_W} height={totalSvgH} fill="url(#topFade)" />
          <rect width={SVG_W} height={totalSvgH} fill="url(#botFade)" />
        </mask>

        {/* Ambient colour glows */}
        <radialGradient id="glowTop" cx="50%" cy="12%" r="45%">
          <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowMid" cx="50%" cy="52%" r="48%">
          <stop offset="0%"   stopColor="#2563eb" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowBot" cx="50%" cy="92%" r="44%">
          <stop offset="0%"   stopColor="#0891b2" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow wash */}
      <rect width={SVG_W} height={totalSvgH} fill="url(#glowTop)" />
      <rect width={SVG_W} height={totalSvgH} fill="url(#glowMid)" />
      <rect width={SVG_W} height={totalSvgH} fill="url(#glowBot)" />

      {/* Pyramid bands */}
      <g mask="url(#pyramidMask)">
        {PYRAMID_LEVELS.map((lv, i) => {
          const y   = TOP_Y + i * (LEVEL_H + GAP);
          const t   = i / (TOTAL - 1);
          const w   = TOP_W + (BASE_W - TOP_W) * t;
          const x   = CX - w / 2;
          const isH = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Normal bg — fades out on hover */}
              <rect
                x={x} y={y} width={w} height={LEVEL_H}
                rx="8"
                fill={`url(#lgrad${i})`}
                stroke={lv.color}
                strokeWidth="0.7"
                strokeOpacity="0.35"
                style={{ opacity: isH ? 0 : 1, transition: 'opacity 0.22s' }}
              />

              {/* Hovered bg — fades in on hover */}
              <rect
                x={x} y={y} width={w} height={LEVEL_H}
                rx="8"
                fill={`url(#lgradH${i})`}
                stroke={lv.color}
                strokeWidth="1.8"
                strokeOpacity="0.9"
                style={{ opacity: isH ? 1 : 0, transition: 'opacity 0.22s' }}
              />

              {/* Shimmer line along top edge */}
              <rect
                x={x + 16} y={y + 1.5} width={w - 32} height="1.5"
                rx="1"
                fill={`url(#lgradS${i})`}
                style={{ opacity: isH ? 1 : 0, transition: 'opacity 0.22s' }}
              />

              {/* Left accent bar — grows on hover */}
              <rect
                x={x} y={y} width={isH ? 6 : 5} height={LEVEL_H}
                rx="4"
                fill={lv.color}
                opacity={isH ? 1 : 0.45}
                style={{ transition: 'all 0.22s' }}
              />

              {/* Label */}
              <text
                x={x + 26} y={y + LEVEL_H / 2 - 11}
                dominantBaseline="central"
                fontSize={isH ? 20 : 18}
                fontWeight="700"
                fill={isH ? '#ffffff' : '#94a3b8'}
                style={{ fontFamily: "'DM Sans','Outfit',sans-serif", transition: 'all 0.22s' }}
              >
                {lv.label}
              </text>

              {/* Sub-label */}
              <text
                x={x + 26} y={y + LEVEL_H / 2 + 14}
                dominantBaseline="central"
                fontSize="11.5"
                fill={isH ? lv.color : '#3f5168'}
                opacity={isH ? 1 : 0.7}
                style={{ fontFamily: 'ui-monospace,monospace', transition: 'all 0.22s' }}
              >
                {lv.sub}
              </text>

              {/* Level badge */}
              <text
                x={x + w - 22} y={y + LEVEL_H / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize="14" fontWeight="700"
                fill={lv.color}
                opacity={isH ? 0.95 : 0.35}
                style={{ fontFamily: 'ui-monospace,monospace', transition: 'all 0.22s' }}
              >
                L{TOTAL - i}
              </text>
            </g>
          );
        })}
      </g>

      <text x="22" y={TOP_Y + 14} fontSize="9.5" fill="#1e3a5f"
        style={{ fontFamily: 'ui-monospace, monospace' }} letterSpacing="1.8">
        ▲ HIGHER ORDER
      </text>
      <text x="22" y={totalSvgH - 14} fontSize="9.5" fill="#1e3a5f"
        style={{ fontFamily: 'ui-monospace, monospace' }} letterSpacing="1.8">
        ▼ LOWER ORDER
      </text>
      <text x={CX} y={totalSvgH - 10} textAnchor="middle" fontSize="9"
        fill="#1e293b" letterSpacing="3.5"
        style={{ fontFamily: 'ui-monospace, monospace' }}>
        BLOOM'S REVISED TAXONOMY · ANDERSON &amp; KRATHWOHL 2001
      </text>
    </svg>
  );
}


/* ══════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════ */
export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [user, setUser]                   = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      icon:        <Brain className="w-5 h-5" />,
      title:       "Bloom's Taxonomy Mapping",
      description: "Automated identification and mapping of questions to appropriate Bloom's cognitive levels.",
      from: 'from-blue-500',   to: 'to-cyan-500',
      border: 'border-blue-500/30',   shadow: 'shadow-blue-500/15',
    },
    {
      icon:        <Target className="w-5 h-5" />,
      title:       'Course Outcome Analysis',
      description: 'Precise correlation between questions and Course Outcomes (COs) for engineering curricula.',
      from: 'from-violet-500', to: 'to-purple-600',
      border: 'border-violet-500/30', shadow: 'shadow-violet-500/15',
    },
    {
      icon:        <BookOpen className="w-5 h-5" />,
      title:       'Module Coverage',
      description: 'Comprehensive analysis of curriculum module weightage and balanced content distribution.',
      from: 'from-teal-500',   to: 'to-emerald-500',
      border: 'border-teal-500/30',   shadow: 'shadow-teal-500/15',
    },
    {
      icon:        <BarChart3 className="w-5 h-5" />,
      title:       'Difficulty Assessment',
      description: 'Systematic evaluation of question difficulty levels to ensure balanced assessment.',
      from: 'from-orange-500', to: 'to-amber-500',
      border: 'border-orange-500/30', shadow: 'shadow-orange-500/15',
    },
    {
      icon:        <GitMerge className="w-5 h-5" />,
      title:       'CO-PO Mapping Analysis',
      description: 'Deep analysis of CO to PO mapping, ensuring questions drive holistic program-level competencies.',
      from: 'from-rose-500',   to: 'to-pink-600',
      border: 'border-rose-500/30',   shadow: 'shadow-rose-500/15',
    },
  ];

  const whyItems = [
    {
      title:       'Outcome-Based Education (OBE) Compliance',
      description: 'Perfect alignment with OBE principles, ensuring systematic CO mapping and assessment criteria.',
      from: 'from-blue-500', to: 'to-cyan-500',
    },
    {
      title:       'Rule-Based Evaluation',
      description: 'Standalone system with customizable criteria, eliminating human bias in question paper assessment.',
      from: 'from-violet-500', to: 'to-purple-600',
    },
    {
      title:       'Engineering Domain Focus',
      description: 'Specifically designed for engineering curricula with comprehensive module coverage analysis.',
      from: 'from-teal-500', to: 'to-emerald-500',
    },
  ];

  const checkUserAuth = () => {
    const token    = sessionStorage.getItem('accessToken');
    const userData = sessionStorage.getItem('user');
    if (token && userData) {
      try { const p = JSON.parse(userData); setUser(p); return p; }
      catch { sessionStorage.removeItem('accessToken'); sessionStorage.removeItem('user'); setUser(null); return null; }
    } else { setUser(null); return null; }
  };

  useEffect(() => { checkUserAuth(); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === 'accessToken' || e.key === 'user') checkUserAuth(); };
    window.addEventListener('storage', h);
    window.addEventListener('authStateChanged', checkUserAuth);
    return () => { window.removeEventListener('storage', h); window.removeEventListener('authStateChanged', checkUserAuth); };
  }, []);
  useEffect(() => {
    const iv = setInterval(() => {
      const t = sessionStorage.getItem('accessToken');
      if ((!t && user) || (t && !user)) checkUserAuth();
    }, 1000);
    return () => clearInterval(iv);
  }, [user]);
  useEffect(() => {
    const iv = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3000);
    return () => clearInterval(iv);
  }, [features.length]);

  const handleAnalyzeClick = () => {
    const u = checkUserAuth();
    if (!u) { alert('Please log in to access the analyze feature'); return; }
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[560px] h-[560px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[260px] bg-blue-900/15 rounded-full blur-[80px]" />
        </div>

        <div className="absolute inset-0 opacity-[0.022] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(148,163,184,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Pyramid — right 62% */}
        <div className="absolute inset-y-0 right-0 pointer-events-none overflow-hidden" style={{ width: '62%' }}>
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 70% 35% at 55% 8%,  rgba(168,85,247,0.20) 0%, transparent 65%),
              radial-gradient(ellipse 65% 40% at 50% 50%, rgba(37,99,235,0.16)  0%, transparent 65%),
              radial-gradient(ellipse 70% 30% at 55% 92%, rgba(8,145,178,0.18)  0%, transparent 65%)
            `,
          }} />
          <div className="absolute inset-y-0 left-0 w-48 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgb(3 7 18), transparent)' }}
          />
          <p className="absolute top-8 left-1/2 -translate-x-1/2 z-10
            text-[10px] font-mono uppercase tracking-[0.28em] text-slate-600
            whitespace-nowrap pointer-events-none">
            Hover each level to explore
          </p>
          {/* Make this div pointer-events-auto so hover works */}
          <div className="w-full h-full flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
            <BloomsPyramid />
          </div>
        </div>

        {/* Left text content */}
        <div className="relative z-10 w-full px-8 lg:px-16 py-16 pointer-events-none">
          <div className="max-w-full lg:max-w-[48%] space-y-8">

            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              border border-blue-500/30 bg-blue-500/10 text-blue-300
              text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              🎓 Version 2 · CO-PO Mapping Analysis
            </span>

            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.07] tracking-tight">
              Automated{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Question Paper
              </span>
              <br />Quality Analysis
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed">
              Ensure academic excellence with our rule-based system for engineering examination analysis.
              Systematic evaluation of difficulty levels, CO mapping, and Bloom's taxonomy alignment.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAnalyzeClick}
                disabled={!user}
                className={`pointer-events-auto group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold
                  bg-gradient-to-r from-blue-500 to-purple-600 text-white
                  shadow-xl shadow-blue-500/25 transition-all duration-200
                  ${user ? 'hover:-translate-y-0.5 hover:shadow-blue-500/40' : 'opacity-45 cursor-not-allowed'}`}
              >
                Analyze Question Paper
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="pointer-events-auto inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold
                border border-gray-700 text-gray-300
                hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-200">
                <Eye className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            <div className="flex gap-10 pt-5 border-t border-gray-800/70">
              {[
                { val: '6',     lbl: "Bloom's levels" },
                { val: 'OBE',   lbl: 'Compliant' },
                { val: 'CO→PO', lbl: 'Full mapping' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-xl font-extrabold text-white tracking-tight">{s.val}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(99,102,241,0.04),transparent)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              border border-purple-500/30 bg-purple-500/10 text-purple-300
              text-[11px] font-bold uppercase tracking-[0.14em] mb-5">
              ✨ Core Capabilities
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
              Comprehensive Quality Analysis
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Systematic evaluation ensuring your engineering question papers meet OBE standards
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((f, i) => {
              const active = activeFeature === i;
              return (
                <div key={i} onClick={() => setActiveFeature(i)}
                  className={`relative group cursor-pointer rounded-2xl p-5 border transition-all duration-300
                    ${active
                      ? `bg-gray-900 ${f.border} shadow-2xl ${f.shadow} -translate-y-1`
                      : 'bg-gray-900/40 border-gray-800/50 hover:border-gray-700/80 hover:-translate-y-0.5 hover:bg-gray-900/60'
                    }`}
                >
                  <div className={`absolute top-0 inset-x-0 h-[2px] rounded-t-2xl bg-gradient-to-r ${f.from} ${f.to}
                    transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.from} ${f.to}
                    flex items-center justify-center text-white mb-4 shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-[13px] mb-2 leading-snug">{f.title}</h3>
                  <p className="text-gray-500 text-[12px] leading-relaxed">{f.description}</p>
                  {active && (
                    <div className={`absolute bottom-3.5 right-3.5 w-1.5 h-1.5 rounded-full
                      bg-gradient-to-r ${f.from} ${f.to} animate-pulse`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY QMETRIC */}
      <section id="about" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              border border-teal-500/30 bg-teal-500/10 text-teal-300
              text-[11px] font-bold uppercase tracking-[0.14em] mb-5">
              🎯 Why QMetric
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Why Choose Our Quality Analysis System?
            </h2>
          </div>
          <div className="space-y-4">
            {whyItems.map((item, i) => (
              <div key={i}
                className="group flex items-start gap-4 p-5 rounded-2xl
                  bg-gray-900/50 border border-gray-800/60
                  hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200"
              >
                <div className={`mt-0.5 w-8 h-8 rounded-xl bg-gradient-to-br ${item.from} ${item.to}
                  flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-blue-600/18 to-purple-600/18
            border border-blue-500/20 p-14 lg:p-16 text-center">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-[1px] rounded-3xl border border-white/[0.05] pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                border border-white/10 bg-white/5 text-gray-400
                text-[11px] font-bold uppercase tracking-[0.14em] mb-6">
                Ready to get started?
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                Ready to Ensure Quality Excellence?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Join engineering institutions that trust our systematic approach to question paper quality analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={!user}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold
                    bg-gradient-to-r from-blue-500 to-purple-600 text-white
                    shadow-xl shadow-blue-500/25 transition-all duration-200
                    ${user ? 'hover:-translate-y-0.5 hover:shadow-blue-500/40' : 'opacity-45 cursor-not-allowed'}`}
                >
                  Upload Question Paper
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold
                  border border-gray-700 text-gray-300
                  hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-200">
                  View Sample Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}