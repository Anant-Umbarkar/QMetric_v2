import React, { useState } from 'react';
import { Trash2, Upload, FileText, Check, Target, BookOpen, Loader2, AlertCircle } from 'lucide-react';

const Tooltip = ({ children, tip }) => (
  <span className="relative inline-block group cursor-help ml-1">
    {children}
    <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150
      absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2
      bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-lg px-3 py-2
      whitespace-nowrap z-50 pointer-events-none shadow-xl leading-snug">
      {tip}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </span>
  </span>
);

const fieldTips = {
  "College Name":   "Full official name of your institution, e.g. 'Anna University'",
  "Branch":         "Your department/stream, e.g. 'CSE', 'ECE', 'Mechanical'",
  "Year Of Study":  "Academic year number, e.g. '2 for second year'",
  "Semester":       "Current semester number, e.g. '3'",
  "Course Name":    "Full subject name, e.g. 'Data Structures and Algorithms'",
  "Course Code":    "Official code from your syllabus, e.g. 'CS3301'",
  "Course Teacher": "Faculty name teaching this course, e.g. 'Dr. R. Krishnamurthy'",
};

const SectionCard = ({ badge, title, subtitle, icon, children }) => (
  <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      {badge && <span className="px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg">{badge}</span>}
      {icon && icon}
      <div>
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const UploadPage = () => {
  const [formData, setFormData] = useState({
    "College Name": "",
    "Branch": "",
    "Year Of Study": "",
    "Semester": "",
    "Course Name": "",
    "Course Code": "",
    "Course Teacher": ""
  });

  const [courseOutcomes, setCourseOutcomes] = useState([]);
  const [modules, setModules] = useState([]);
  const [numCOs, setNumCOs] = useState('');
  const [numModules, setNumModules] = useState('');
  const [numPOs, setNumPOs] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const labelClass = "block text-gray-300 text-sm font-medium mb-2";
  const inputClass = "w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const getCurrentWeightSum = () => courseOutcomes.reduce((sum, co) => sum + (parseFloat(co.weight) || 0), 0);

  const getPOKeys = () => {
    const n = parseInt(numPOs) || 0;
    return Array.from({ length: n }, (_, i) => `PO${i + 1}`);
  };

  const validateForm = () => {
    setError('');

    const allFields = Object.keys(formData);
    for (let field of allFields) {
      if (!formData[field].trim()) { setError(`${field} is required`); return false; }
    }

    if (courseOutcomes.length === 0) { setError("At least one course outcome is required"); return false; }

    for (let i = 0; i < courseOutcomes.length; i++) {
      const co = courseOutcomes[i];
      if (!co.weight || parseFloat(co.weight) <= 0) { setError(`Course Outcome ${i + 1} must have a valid weight`); return false; }
      if (!co.blooms) { setError(`Course Outcome ${i + 1} must have a Bloom's level selected`); return false; }
    }

    const totalWeight = courseOutcomes.reduce((sum, co) => sum + (parseFloat(co.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) { setError(`CO weights must sum to 100%. Current: ${totalWeight.toFixed(1)}%`); return false; }

    if (modules.length === 0) { setError("At least one module is required"); return false; }
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.name.trim()) { setError(`Module ${i + 1} name is required`); return false; }
      if (!module.hours || parseFloat(module.hours) <= 0) { setError(`Module ${i + 1} must have valid teaching hours`); return false; }
    }

    const poKeys = getPOKeys();
    if (poKeys.length > 0) {
      for (let i = 0; i < courseOutcomes.length; i++) {
        const co = courseOutcomes[i];
        for (let po of poKeys) {
          const val = co.poMapping?.[po];
          if (val !== undefined && val !== '' && (isNaN(val) || val < 0 || val > 3)) {
            setError(`CO${i + 1} → ${po} mapping must be between 0 and 3`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const createCO = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    weight: "",
    blooms: "",
    poMapping: {}
  });

  const createModule = () => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    hours: ""
  });

  const handleNumCOsChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setNumCOs(e.target.value);
    if (num > 20) { setError('Maximum 20 course outcomes allowed'); return; }
    setError('');
    setCourseOutcomes(prev => {
      if (num <= 0) return [];
      if (num > prev.length) {
        const extras = Array.from({ length: num - prev.length }, () => createCO());
        return [...prev, ...extras];
      }
      return prev.slice(0, num);
    });
  };

  const handleNumModulesChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setNumModules(e.target.value);
    if (num > 20) { setError('Maximum 20 modules allowed'); return; }
    setError('');
    setModules(prev => {
      if (num <= 0) return [];
      if (num > prev.length) {
        const extras = Array.from({ length: num - prev.length }, () => createModule());
        return [...prev, ...extras];
      }
      return prev.slice(0, num);
    });
  };

  const handleNumPOsChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setNumPOs(e.target.value);
    if (num > 12) { setError('Maximum 12 POs allowed'); return; }
    setError('');
    setCourseOutcomes(prev => prev.map(co => ({ ...co, poMapping: {} })));
  };

  const deleteCO = (index) => {
    setCourseOutcomes(prev => prev.filter((_, i) => i !== index));
    setNumCOs(prev => String(parseInt(prev) - 1));
  };

  const handleCOChange = (index, field, value) => {
    setCourseOutcomes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setError('');
  };

  const deleteModule = (index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
    setNumModules(prev => String(parseInt(prev) - 1));
  };

  const handleModuleChange = (index, field, value) => {
    setModules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setError('');
  };

  const handlePOMappingChange = (coIndex, poKey, value) => {
    setCourseOutcomes(prev => {
      const updated = [...prev];
      updated[coIndex] = {
        ...updated[coIndex],
        poMapping: {
          ...updated[coIndex].poMapping,
          [poKey]: value === '' ? '' : parseInt(value)
        }
      };
      return updated;
    });
    setError('');
  };

  const isValidFileType = (f) =>
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(f.type);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && isValidFileType(f)) { setFile(f); setError(''); }
    else setError('Please upload a valid Excel (.xlsx, .xls) file');
  };
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (isValidFileType(f)) { setFile(f); setError(''); }
      else { setError('Please upload a valid Excel (.xlsx, .xls) file'); e.target.value = ''; }
    }
  };

  const handleSubmit = async () => {
    if (!file) { setError("Please upload a file (Excel)!"); return; }
    if (!validateForm()) return;
    setIsUploading(true); setError('');

    const poKeys = getPOKeys();

    const transformedSequence = [
      ...courseOutcomes.map((co, index) => {
        const poMapping = {};
        poKeys.forEach(po => {
          const val = co.poMapping?.[po];
          if (val !== undefined && val !== '' && parseInt(val) > 0) {
            poMapping[po] = parseInt(val);
          }
        });
        return {
          name: `CO${index + 1}`,
          type: "CO",
          weight: parseFloat(co.weight),
          blooms: [co.blooms],
          poMapping
        };
      }),
      ...modules.map((module, index) => ({
        name: `Module ${index + 1}`,
        type: "Module",
        hours: parseFloat(module.hours)
      }))
    ];

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    formDataToSend.append("FormData", JSON.stringify(formData));
    formDataToSend.append("Sequence", JSON.stringify(transformedSequence));

    try {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found. Please login first.');

      const response = await fetch(`http://localhost:80/upload/totext`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (response.ok) {
        try {
          const responseData = await response.json();
          const resultId = responseData._id || responseData.id || responseData;

          if (resultId) {
            alert('File uploaded and processed successfully!');
            window.location.href = '/result';
            setFile(null);
            setCourseOutcomes([]);
            setModules([]);
            setNumCOs('');
            setNumModules('');
            setNumPOs('');
            setFormData({
              "College Name": "", "Branch": "", "Year Of Study": "",
              "Semester": "", "Course Name": "", "Course Code": "", "Course Teacher": ""
            });
          } else throw new Error('No result ID received from server');
        } catch { setError('Invalid response from server. Please try again.'); }
      } else {
        try {
          const text = await response.text();
          let msg;
          try {
            const d = JSON.parse(text);
            msg = d.message || d.error || text;
          } catch { msg = text; }
          if (response.status === 403) setError('Access denied. Please check your authentication or login again.');
          else if (response.status === 401) setError('Authentication required. Please login again.');
          else if (response.status === 413) setError('File too large. Please upload a smaller file.');
          else setError(`Upload failed: ${msg}`);
        } catch { setError(`Server error: ${response.status} ${response.statusText}`); }
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) setError('Network error. Please check your connection.');
      else if (!navigator.onLine) setError('No internet connection. Please check your connection.');
      else setError(`Upload failed: ${err.message || 'Unknown error occurred'}`);
    } finally { setIsUploading(false); }
  };

  const downloadSample = () => {
    const csv = [
      ['Question', 'CO', 'Marks', 'Difficulty', 'Module'],
      ["What is the definition of...?", 'CO1', '5', 'Easy', 'Module 1'],
      ["Explain the concept of...?", 'CO2', '10', 'Medium', 'Module 2'],
      ["Analyze the following...?", 'CO3', '15', 'Hard', 'Module 3']
    ].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'sample_paper_format.csv'
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const weightSum = getCurrentWeightSum();
  const weightOk = Math.abs(weightSum - 100) <= 0.01;
  const poKeys = getPOKeys();

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Upload size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Upload Paper & Details</h1>
            <p className="text-xs text-gray-400">Fill in all sections, then submit for analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5 relative">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-900/30 border border-red-500/40 rounded-2xl p-4">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-red-300 font-semibold text-sm">Error</p>
              <p className="text-red-400 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* 1. Course Information */}
        <SectionCard badge="1" title="Course Information" subtitle="Basic details about the course and institution">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className={labelClass}>
                  {key}
                  <Tooltip tip={fieldTips[key]}>
                    <span className="text-red-400">*</span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder={`Enter ${key.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 2. Course Outcomes */}
        <SectionCard
          icon={<Target size={16} />}
          title="Course Outcomes"
          subtitle="Define learning objectives with weights and cognitive levels. Weights must sum to 100%."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className={labelClass}>
                Number of Course Outcomes
                <Tooltip tip="How many Course Outcomes this subject has. Typically 5–7. Max 20.">
                  <span className="text-red-400">*</span>
                </Tooltip>
              </label>
              <input
                type="number" value={numCOs} onChange={handleNumCOsChange}
                min="1" max="20" placeholder="Enter number (1–20)"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Number of Programme Outcomes (POs)
                <Tooltip tip="Total POs your programme has. Typically 12 for engineering. Leave 0 to skip PO mapping.">
                  <span className="text-gray-500">*</span>
                </Tooltip>
              </label>
              <input
                type="number" value={numPOs} onChange={handleNumPOsChange}
                min="0" max="12" placeholder="Enter number (0–12)"
                className={inputClass}
              />
            </div>
          </div>

          {courseOutcomes.length > 0 && (
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-700/50">
              <span className="text-gray-400 text-sm">Total Weight:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${weightOk
                  ? 'bg-green-500/15 border-green-500/40 text-green-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
                }`}>
                {weightSum.toFixed(1)}% {weightOk ? '✓ Good to go' : '— must reach 100%'}
              </span>
            </div>
          )}

          {courseOutcomes.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-700/10">
              <Target className="text-gray-600 mx-auto mb-3" size={34} />
              <p className="text-gray-400 font-medium text-sm">No course outcomes yet</p>
              <p className="text-gray-500 text-xs mt-1">Enter the number above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseOutcomes.map((co, index) => (
                <div key={co.id}
                  className="bg-gray-700/30 border border-gray-600/40 rounded-xl p-4 group hover:border-gray-500/60 hover:bg-gray-700/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg">
                        CO{index + 1}
                      </span>
                      <span className="text-gray-200 text-sm font-medium">Course Outcome {index + 1}</span>
                    </div>
                    <button type="button" onClick={() => deleteCO(index)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Weight + Blooms */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Weight (%)
                        <Tooltip tip="% of total marks this CO carries. All CO weights must sum to 100%.">
                          <span className="text-red-400">*</span>
                        </Tooltip>
                      </label>
                      <input
                        type="number" placeholder="0–100" value={co.weight}
                        onChange={(e) => handleCOChange(index, 'weight', e.target.value)}
                        className={inputClass} min="0" max="100" step="0.1"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Bloom's Level
                        <Tooltip tip="Cognitive level this CO targets — from Remember (lowest) to Create (highest).">
                          <span className="text-red-400">*</span>
                        </Tooltip>
                      </label>
                      <select value={co.blooms}
                        onChange={(e) => handleCOChange(index, 'blooms', e.target.value)}
                        className={`${inputClass} cursor-pointer`}>
                        <option value="">Select Level</option>
                        {bloomsLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* PO Mapping Grid */}
                  {poKeys.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-600/40">
                      <p className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1">
                        PO Mapping
                        <Tooltip tip="Correlation strength per Programme Outcome: 0 = none · 1 = low · 2 = medium · 3 = high">
                          <span className="text-gray-500 cursor-help">*</span>
                        </Tooltip>
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                        {poKeys.map(po => (
                          <div key={po} className="flex flex-col items-center gap-1">
                            <span className="text-gray-500 text-xs">{po}</span>
                            <input
                              type="number"
                              min="0" max="3" step="1"
                              placeholder="–"
                              value={co.poMapping?.[po] ?? ''}
                              onChange={(e) => handlePOMappingChange(index, po, e.target.value)}
                              className="w-full text-center px-1 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 3. Modules */}
        <SectionCard
          icon={<BookOpen size={16} />}
          title="Course Modules"
          subtitle="Organize your course content into modules with corresponding teaching hours."
        >
          <div className="mb-5">
            <label className={labelClass}>
              Number of Modules
              <Tooltip tip="Total number of units/modules in this course. Typically 5. Max 20.">
                <span className="text-red-400">*</span>
              </Tooltip>
            </label>
            <input type="number" value={numModules} onChange={handleNumModulesChange}
              min="1" max="20" placeholder="Enter number (1–20)"
              className={`${inputClass} md:w-56`} />
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-700/10">
              <BookOpen className="text-gray-600 mx-auto mb-3" size={34} />
              <p className="text-gray-400 font-medium text-sm">No modules yet</p>
              <p className="text-gray-500 text-xs mt-1">Enter the number above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div key={module.id}
                  className="bg-gray-700/30 border border-gray-600/40 rounded-xl p-4 group hover:border-gray-500/60 hover:bg-gray-700/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold rounded-lg">
                        M{index + 1}
                      </span>
                      <span className="text-gray-200 text-sm font-medium">Module {index + 1}</span>
                    </div>
                    <button type="button" onClick={() => deleteModule(index)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Module Name
                        <Tooltip tip="Descriptive name or topic title for this module, e.g. 'Arrays and Linked Lists'">
                          <span className="text-red-400">*</span>
                        </Tooltip>
                      </label>
                      <input type="text" placeholder="Enter module name or topic..."
                        value={module.name} onChange={(e) => handleModuleChange(index, 'name', e.target.value)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Teaching Hours
                        <Tooltip tip="Number of lecture hours allocated to this module per semester.">
                          <span className="text-red-400">*</span>
                        </Tooltip>
                      </label>
                      <input type="number" placeholder="Hours" value={module.hours}
                        onChange={(e) => handleModuleChange(index, 'hours', e.target.value)}
                        className={inputClass} min="0" step="0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 4. File Upload */}
        <SectionCard
          icon={<Upload size={16} />}
          title="Upload Paper File"
          subtitle="Upload your question paper in Excel format (.xlsx or .xls)"
        >
          <div className="flex justify-end mb-4">
            <button type="button" onClick={downloadSample}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 text-xs rounded-lg hover:bg-gray-600 hover:text-white transition-colors">
              <FileText size={13} />
              Download Sample Format
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
              ${dragOver
                ? 'border-blue-400/70 bg-blue-500/5'
                : file
                  ? 'border-green-400/60 bg-green-500/5'
                  : 'border-gray-600/60 hover:border-gray-500 hover:bg-gray-700/20 cursor-pointer'
              }`}
          >
            {file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="text-green-400" size={26} />
                </div>
                <div>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Ready to analyse · {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button type="button" onClick={() => setFile(null)}
                  className="text-red-400 hover:text-red-300 text-sm underline transition-colors">
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gray-700 border border-gray-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload className="text-gray-400" size={26} />
                </div>
                <div>
                  <p className="text-white font-semibold">Drop your file here</p>
                  <p className="text-gray-400 text-sm mt-1">or click the button below to browse</p>
                  <p className="text-gray-500 text-xs mt-2">Supported: .xlsx, .xls · Max 10 MB</p>
                </div>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-xl hover:bg-gray-600 hover:border-gray-500 cursor-pointer transition-colors">
                  <FileText size={14} />
                  Choose File
                </label>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex justify-center pb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className={`group flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all duration-200
              bg-gradient-to-r from-blue-500 to-purple-600
              ${(!file || isUploading)
                ? 'opacity-50 cursor-not-allowed shadow-none'
                : 'hover:scale-105 hover:shadow-blue-500/30 hover:shadow-2xl'
              }`}
          >
            {isUploading ? (
              <><Loader2 size={20} className="animate-spin" />Uploading &amp; Analysing...</>
            ) : (
              <><Check size={20} className="group-hover:scale-110 transition-transform" />Submit Paper for Analysis</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadPage;