import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Circle, Clipboard, Download, Plus,
  ChevronRight, ChevronLeft, Save, LayoutList,
  Settings, FolderUp, Link as LinkIcon, User, Tag,
  AlertCircle
} from 'lucide-react';

// --- Constants ---
const CATEGORIES = [
  "Programming & Scripting", "Asset Creation", "Character & Animation", 
  "World Creation", "Rendering", "Cinematics & Media", 
  "Platform & Builds", "Audio", "Pipeline & Plugins", 
  "Getting Started & Setup (Twinmotion Only)"
];

const ENTITY_TYPES = ["Course Module", "Tutorial"];
const APPLICATIONS = ["Unreal Engine", "MetaHuman", "UEFN", "Twinmotion", "RealityCapture"];
const INDUSTRIES = [
  "Games", "Film & Television", "Architecture", "Automotive",
  "Manufacturing", "Simulation", "Visualization", "Broadcast & Live Events",
  "Advertising", "Education", "AEC"
];

const USERNAME_OPTIONS = ['Ed_Bennett', 'sean.lake', 'BrianJPohl', 'Sam_Deiter', 'KevinMiller', 'THATRYANMANNING', 'jh_epic'];

const INITIAL_MODULE_STATE = {
  id: '',
  colA_courseNumber: '',
  colB_courseName: '',
  colC_moduleTitle: '',
  colD_description: '',
  colF_username: '',
  colG_categories: [],
  colH_entityType: '',
  colI_application: '',
  colJ_softwareVersion: '',
  colK_industry: [],
  colO_videoLink: '',
  // Phase 5 Tracking
  p5_folderCreated: false,
  p5_bannerCreated: false,
  p5_thumbCreated: false,
};

// --- Helper Functions ---
const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
};

const calculateProgress = (mod) => {
  const requiredFields = [
    'colA_courseNumber', 'colB_courseName', 'colC_moduleTitle',
    'colD_description', 'colH_entityType', 'colI_application',
    'colO_videoLink'
  ];
  const filled = requiredFields.filter(field => mod[field] && mod[field].trim() !== '').length;

  let extraScore = 0;
  if(mod.p5_folderCreated) extraScore++;

  return Math.round(((filled + extraScore) / (requiredFields.length + 1)) * 100);
};

export default function App() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [activePhase, setActivePhase] = useState(1);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [isOtherUsername, setIsOtherUsername] = useState(false);

  // Persistent state carried over between modules within the same course
  const [persistentState, setPersistentState] = useState(() => {
    try {
      const saved = localStorage.getItem('courseProcessingPersistent');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Sync persistent state to localStorage
  useEffect(() => {
    localStorage.setItem('courseProcessingPersistent', JSON.stringify(persistentState));
  }, [persistentState]);

  // --- Handlers ---
  const handleCreateNew = () => {
    const newMod = {
      ...INITIAL_MODULE_STATE,
      id: Date.now().toString(),
      // Carry over course info from the last module if it exists to speed up data entry
      colA_courseNumber: modules.length > 0 ? modules[0].colA_courseNumber : '',
      colB_courseName: modules.length > 0 ? modules[0].colB_courseName : '',
      // Auto-fill from persistent state (Phase 3 & 4 carryover)
      colF_username: persistentState.colF_username || '',
      colH_entityType: persistentState.colH_entityType || '',
      colI_application: persistentState.colI_application || '',
    };
    setCurrentModule(newMod);
    setIsOtherUsername(!USERNAME_OPTIONS.includes(newMod.colF_username) && newMod.colF_username !== '');
    setActivePhase(1);
    setView('editor');
  };

  const saveModuleToList = () => {
    if (!currentModule) return;
    setModules(prev => {
      const exists = prev.find(m => m.id === currentModule.id);
      if (exists) {
        return prev.map(m => m.id === currentModule.id ? currentModule : m);
      }
      return [currentModule, ...prev];
    });
  };

  const handleSaveModule = () => {
    saveModuleToList();
    setView('dashboard');
  };

  const handleFinishModule = () => {
    saveModuleToList();
    // Persist fields for the next module in the same course
    setPersistentState({
      colF_username: currentModule.colF_username,
      colH_entityType: currentModule.colH_entityType,
      colI_application: currentModule.colI_application,
    });
    setView('dashboard');
  };

  const handleFinishCourse = () => {
    saveModuleToList();
    // Clear persistent state so next module starts fresh
    setPersistentState({});
    setView('dashboard');
  };

  const handleUpdateField = (field, value) => {
    setCurrentModule(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (cat) => {
    setCurrentModule(prev => {
      const cats = prev.colG_categories.includes(cat)
        ? prev.colG_categories.filter(c => c !== cat)
        : [...prev.colG_categories, cat];
      return { ...prev, colG_categories: cats };
    });
  };

  const toggleIndustry = (industry) => {
    setCurrentModule(prev => {
      const current = prev.colK_industry || [];
      const updated = current.includes(industry)
        ? current.filter(i => i !== industry)
        : [...current, industry];
      return { ...prev, colK_industry: updated };
    });
  };

  // --- Validation ---
  const PHASE_REQUIRED_FIELDS = {
    1: [
      { key: 'colA_courseNumber', label: 'Course Number' },
      { key: 'colB_courseName', label: 'Course Name' },
      { key: 'colC_moduleTitle', label: 'Module Title' },
    ],
    2: [
      { key: 'colD_description', label: 'Description' },
    ],
    3: [
      { key: 'colF_username', label: 'Username' },
    ],
    4: [
      { key: 'colH_entityType', label: 'Entity Type' },
      { key: 'colI_application', label: 'Application' },
    ],
    5: [
      { key: 'p5_folderCreated', label: 'Folder Setup', isCheckbox: true },
    ],
    6: [
      { key: 'colO_videoLink', label: 'Video Share Link' },
    ],
  };

  const getMissingFields = (phaseNum) => {
    if (!currentModule) return [];
    return PHASE_REQUIRED_FIELDS[phaseNum].filter(f => {
      const val = currentModule[f.key];
      if (f.isCheckbox) return !val;
      return !val || (typeof val === 'string' && val.trim() === '');
    });
  };

  const isFieldMissing = (key) => {
    if (!currentModule) return false;
    const val = currentModule[key];
    if (typeof val === 'boolean') return !val;
    return !val || (typeof val === 'string' && val.trim() === '');
  };

  const exportCSV = () => {
    const headers = [
      "A: Course Number", "B: Course Name", "C: Module Title", "D: Description",
      "E: (Reserved)", "F: Username", "G: Categories", "H: Entity Type",
      "I: Application", "J: Software Version", "K: Industry",
      "L: (Reserved)", "M: (Reserved)", "N: (Reserved)", "O: Video Share Link"
    ];

    const rows = modules.map(m => [
      `"${m.colA_courseNumber}"`, `"${m.colB_courseName}"`, `"${m.colC_moduleTitle}"`, `"${m.colD_description.replace(/"/g, '""')}"`,
      `""`, `"${m.colF_username}"`, `"${m.colG_categories.join(', ')}"`, `"${m.colH_entityType}"`,
      `"${m.colI_application}"`, `"${m.colJ_softwareVersion}"`, `"${Array.isArray(m.colK_industry) ? m.colK_industry.join(', ') : m.colK_industry}"`,
      `""`, `""`, `""`, `"${m.colO_videoLink}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "course_metadata_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation */}
      <nav className="bg-indigo-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2 font-bold text-xl cursor-pointer" onClick={() => setView('dashboard')}>
          <LayoutList size={24} />
          <span>Course Processing Tracker</span>
        </div>
        <div className="flex space-x-3">
          {view === 'dashboard' && (
            <button onClick={exportCSV} className="flex items-center space-x-1 bg-indigo-500 hover:bg-indigo-400 px-3 py-1.5 rounded-md text-sm transition">
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          )}
          <button onClick={handleCreateNew} className="flex items-center space-x-1 bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md text-sm font-semibold transition">
            <Plus size={16} />
            <span>New Module</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Processing Queue</h2>
            {modules.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-xl shadow-sm border border-slate-200">
                <FolderUp size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No modules tracked yet</h3>
                <p className="text-slate-500 mb-6">Start processing your first video module to build your tracking list.</p>
                <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition inline-flex items-center">
                  <Plus size={18} className="mr-2"/> Begin First Module
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-sm border-b border-slate-200">
                      <th className="p-4 font-semibold">Course No.</th>
                      <th className="p-4 font-semibold">Module Title</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Progress</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => {
                      const progress = calculateProgress(mod);
                      return (
                        <tr key={mod.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 font-mono text-sm text-indigo-600 font-medium">{mod.colA_courseNumber || 'TBD'}</td>
                          <td className="p-4 font-medium">{mod.colC_moduleTitle || 'Untitled Module'}</td>
                          <td className="p-4">
                            {progress === 100 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Complete</span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Progress</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[150px]">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs text-slate-500 font-medium">{progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => { setCurrentModule(mod); setIsOtherUsername(!USERNAME_OPTIONS.includes(mod.colF_username) && mod.colF_username !== ''); setActivePhase(1); setView('editor'); }}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                            >
                              Edit / Continue
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Sidebar - Phase Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Workflow Phases</h3>
                <nav className="space-y-1">
                  {[
                    { num: 1, title: 'Source Data', icon: <Settings size={18}/> },
                    { num: 2, title: 'AI Description', icon: <LayoutList size={18}/> },
                    { num: 3, title: 'Instructor', icon: <User size={18}/> },
                    { num: 4, title: 'Categorization', icon: <Tag size={18}/> },
                    { num: 5, title: 'Visual Assets', icon: <FolderUp size={18}/> },
                    { num: 6, title: 'Final Linking', icon: <LinkIcon size={18}/> },
                  ].map(phase => {
                    const missing = getMissingFields(phase.num);
                    const phaseComplete = PHASE_REQUIRED_FIELDS[phase.num].length > 0 && missing.length === 0;
                    const hasRequired = PHASE_REQUIRED_FIELDS[phase.num].length > 0;
                    return (
                      <button
                        key={phase.num}
                        onClick={() => setActivePhase(phase.num)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          activePhase === phase.num
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`${activePhase === phase.num ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {phase.icon}
                          </span>
                          <span>Phase {phase.num}</span>
                        </div>
                        {hasRequired && (
                          phaseComplete
                            ? <CheckCircle size={16} className="text-green-500" />
                            : <span className="flex items-center space-x-1 text-amber-500">
                                <AlertCircle size={14} />
                                <span className="text-xs">{missing.length}</span>
                              </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-8 pt-4 border-t border-slate-100">
                   <button 
                    onClick={handleSaveModule}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition"
                  >
                    <Save size={16} />
                    <span>Save & Exit</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
                
                {/* --- PHASE 1 --- */}
                {activePhase === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 1: Source Data Extraction</h2>
                      <p className="text-slate-500 text-sm mt-1">Locate course files and extract basic metadata.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Course Number (Col A) *</label>
                          <input type="text" value={currentModule.colA_courseNumber} onChange={(e) => handleUpdateField('colA_courseNumber', e.target.value)}
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colA_courseNumber') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`} placeholder="e.g. CNH100.01" />
                          {isFieldMissing('colA_courseNumber') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Course Name (Col B) *</label>
                          <input type="text" value={currentModule.colB_courseName} onChange={(e) => handleUpdateField('colB_courseName', e.target.value)}
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colB_courseName') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`} placeholder="e.g. Intro to Rendering" />
                          {isFieldMissing('colB_courseName') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Module Title (Col C) *</label>
                        <p className="text-xs text-amber-600 mb-2 font-medium">Note: Transcribe exact text from Title Slide. Do NOT use file name.</p>
                        <input type="text" value={currentModule.colC_moduleTitle} onChange={(e) => handleUpdateField('colC_moduleTitle', e.target.value)}
                          className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colC_moduleTitle') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`} placeholder="Exact on-screen title" />
                        {isFieldMissing('colC_moduleTitle') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- PHASE 2 --- */}
                {activePhase === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 2: AI Description Generation</h2>
                      <p className="text-slate-500 text-sm mt-1">Use AI to summarize the video preview.</p>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-800">Prompt for AI Tool:</h4>
                        <p className="text-indigo-600 italic text-sm mt-1">"Create a description for this video that is one short sentence."</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard("Create a description for this video that is one short sentence.")}
                        className="bg-white border border-indigo-200 text-indigo-700 p-2 rounded-md hover:bg-indigo-100 transition shadow-sm"
                        title="Copy Prompt"
                      >
                        <Clipboard size={18} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Generated Description (Col D) *</label>
                      <div className="relative">
                        <textarea
                          value={currentModule.colD_description}
                          onChange={(e) => handleUpdateField('colD_description', e.target.value)}
                          rows="6"
                          className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colD_description') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`}
                          placeholder="Paste AI output here..."
                        />
                        <div className={`absolute bottom-3 right-3 text-xs font-medium ${currentModule.colD_description.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                          {currentModule.colD_description.length} / 1000 chars
                        </div>
                      </div>
                      {isFieldMissing('colD_description') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                    </div>
                  </div>
                )}

                {/* --- PHASE 3 --- */}
                {activePhase === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 3: Instructor Verification</h2>
                      <p className="text-slate-500 text-sm mt-1">Search EDC &gt; Admin &gt; Users to capture details.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                        <p className="text-sm text-slate-600"><strong>Search Logic:</strong> Display Name → Username → Epic ID.</p>
                        <p className="text-xs text-slate-500 italic mt-1">If no username is found, skip this phase.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username (Col F) *</label>
                        <select
                          value={USERNAME_OPTIONS.includes(currentModule.colF_username) && !isOtherUsername ? currentModule.colF_username : (isOtherUsername || (!USERNAME_OPTIONS.includes(currentModule.colF_username) && currentModule.colF_username) ? '__other__' : '')}
                          onChange={(e) => {
                            if (e.target.value === '__other__') {
                              setIsOtherUsername(true);
                              handleUpdateField('colF_username', '');
                            } else {
                              setIsOtherUsername(false);
                              handleUpdateField('colF_username', e.target.value);
                            }
                          }}
                          className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colF_username') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`}
                        >
                          <option value="">Select a username...</option>
                          {USERNAME_OPTIONS.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option value="__other__">Other...</option>
                        </select>
                        {(isOtherUsername || (!USERNAME_OPTIONS.includes(currentModule.colF_username) && currentModule.colF_username !== '')) && (
                          <input
                            type="text"
                            value={currentModule.colF_username}
                            onChange={(e) => handleUpdateField('colF_username', e.target.value)}
                            className={`w-full border rounded-md p-2 mt-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colF_username') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`}
                            placeholder="Enter custom username..."
                          />
                        )}
                        {isFieldMissing('colF_username') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- PHASE 4 --- */}
                {activePhase === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 4: Categorization</h2>
                      <p className="text-slate-500 text-sm mt-1">Tag relevance and software details.</p>
                    </div>

                    <div className="space-y-6">
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Relevance Tagging (Col G) - Select all that apply</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {CATEGORIES.map(cat => (
                            <label key={cat} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                              <input type="checkbox" checked={currentModule.colG_categories.includes(cat)} onChange={() => toggleCategory(cat)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                              <span className="text-sm text-slate-700">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Entity Type (Col H) *</label>
                          <select value={currentModule.colH_entityType} onChange={(e) => handleUpdateField('colH_entityType', e.target.value)}
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white ${isFieldMissing('colH_entityType') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`}>
                            <option value="">Select type...</option>
                            {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                          {isFieldMissing('colH_entityType') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Application (Col I) *</label>
                          <select value={currentModule.colI_application} onChange={(e) => handleUpdateField('colI_application', e.target.value)}
                            className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white ${isFieldMissing('colI_application') ? 'border-amber-400 bg-amber-50' : 'border-slate-300'}`}>
                            <option value="">Select application...</option>
                            {APPLICATIONS.map(app => <option key={app} value={app}>{app}</option>)}
                          </select>
                          {isFieldMissing('colI_application') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Software Version (Col J)</label>
                          <input type="text" value={currentModule.colJ_softwareVersion} onChange={(e) => handleUpdateField('colJ_softwareVersion', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. 5.5" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Industry (Col K) - Select all that apply</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {INDUSTRIES.map(ind => (
                              <label key={ind} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                                <input type="checkbox" checked={(currentModule.colK_industry || []).includes(ind)} onChange={() => toggleIndustry(ind)}
                                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <span className="text-sm text-slate-700">{ind}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* --- PHASE 5 --- */}
                {activePhase === 5 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 5: Visual Asset Creation</h2>
                      <p className="text-slate-500 text-sm mt-1">Generate and upload necessary graphics.</p>
                    </div>

                    <div className="space-y-6">
                      
                      {/* Folder Setup */}
                      <div className={`border rounded-lg p-4 ${isFieldMissing('p5_folderCreated') ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                        {isFieldMissing('p5_folderCreated') && <p className="text-xs text-amber-600 mb-2 font-medium">Not yet completed</p>}
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input type="checkbox" checked={currentModule.p5_folderCreated} onChange={(e) => handleUpdateField('p5_folderCreated', e.target.checked)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-bold text-slate-800">1. Folder Setup</span>
                            <span className="block text-sm text-slate-600">Created folder in THUMBS & BANNERS named:</span>
                            <code className="block mt-1 bg-white border border-slate-300 px-2 py-1 rounded text-sm text-indigo-700 font-mono">
                              {currentModule.colA_courseNumber || '[Number]'} {currentModule.colB_courseName || '[Name]'}
                            </code>
                          </div>
                        </label>
                      </div>


                    </div>
                  </div>
                )}

                {/* --- PHASE 6 --- */}
                {activePhase === 6 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">Phase 6: Final Linking</h2>
                      <p className="text-slate-500 text-sm mt-1">Provide the direct links to the generated assets and final video.</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-indigo-700 mb-1">Video Share Link (Col O) *</label>
                        <p className="text-xs text-slate-500 mb-2">Specific share link for the video file from the source VIDEOS folder.</p>
                        <input type="url" value={currentModule.colO_videoLink} onChange={(e) => handleUpdateField('colO_videoLink', e.target.value)}
                          className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isFieldMissing('colO_videoLink') ? 'border-amber-400 bg-amber-50' : 'border-indigo-300 bg-indigo-50'}`} placeholder="Paste Video Share Link here..." />
                        {isFieldMissing('colO_videoLink') && <p className="text-xs text-amber-600 mt-1">Required</p>}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={() => setActivePhase(Math.max(1, activePhase - 1))}
                  disabled={activePhase === 1}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                    activePhase === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ChevronLeft size={20} className="mr-1"/> Previous
                </button>

                {activePhase < 6 ? (
                  <button
                    onClick={() => setActivePhase(Math.min(6, activePhase + 1))}
                    className="flex items-center px-6 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                  >
                    Next Phase <ChevronRight size={20} className="ml-1"/>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleFinishModule}
                      className="flex items-center px-6 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                    >
                      <CheckCircle size={20} className="mr-2"/> Finish Module
                    </button>
                    <button
                      onClick={handleFinishCourse}
                      className="flex items-center px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-sm"
                    >
                      <CheckCircle size={20} className="mr-2"/> Finish Course
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
