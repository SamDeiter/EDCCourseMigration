import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Clipboard, Download, Plus, 
  ChevronRight, ChevronLeft, Save, LayoutList, 
  Settings, FolderUp, Link as LinkIcon, User, Tag
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

const INITIAL_MODULE_STATE = {
  id: '',
  colA_courseNumber: '',
  colB_courseName: '',
  colC_moduleTitle: '',
  colD_description: '',
  colE_hashId: '',
  colF_username: '',
  colG_categories: [],
  colH_entityType: '',
  colI_application: '',
  colJ_softwareVersion: '',
  colK_industry: '',
  colL_thumbLink: '',
  colM_bannerLink: '',
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
    'colL_thumbLink', 'colM_bannerLink', 'colO_videoLink'
  ];
  const filled = requiredFields.filter(field => mod[field] && mod[field].trim() !== '').length;
  
  // Also count phase 5 checkboxes
  let extraScore = 0;
  if(mod.p5_folderCreated) extraScore++;
  if(mod.p5_bannerCreated) extraScore++;
  if(mod.p5_thumbCreated) extraScore++;
  
  return Math.round(((filled + extraScore) / (requiredFields.length + 3)) * 100);
};

export default function App() {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [activePhase, setActivePhase] = useState(1);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'

  // --- Handlers ---
  const handleCreateNew = () => {
    const newMod = { 
      ...INITIAL_MODULE_STATE, 
      id: Date.now().toString(),
      // Carry over course info from the last module if it exists to speed up data entry
      colA_courseNumber: modules.length > 0 ? modules[0].colA_courseNumber : '',
      colB_courseName: modules.length > 0 ? modules[0].colB_courseName : '',
    };
    setCurrentModule(newMod);
    setActivePhase(1);
    setView('editor');
  };

  const handleSaveModule = () => {
    if (!currentModule) return;
    setModules(prev => {
      const exists = prev.find(m => m.id === currentModule.id);
      if (exists) {
        return prev.map(m => m.id === currentModule.id ? currentModule : m);
      }
      return [currentModule, ...prev];
    });
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

  const exportCSV = () => {
    const headers = [
      "A: Course Number", "B: Course Name", "C: Module Title", "D: Description", 
      "E: HashID", "F: Username", "G: Categories", "H: Entity Type", 
      "I: Application", "J: Software Version", "K: Industry", 
      "L: Thumbnail Link", "M: Banner Link", "N: (Reserved)", "O: Video Share Link"
    ];

    const rows = modules.map(m => [
      `"${m.colA_courseNumber}"`, `"${m.colB_courseName}"`, `"${m.colC_moduleTitle}"`, `"${m.colD_description.replace(/"/g, '""')}"`,
      `"${m.colE_hashId}"`, `"${m.colF_username}"`, `"${m.colG_categories.join(', ')}"`, `"${m.colH_entityType}"`,
      `"${m.colI_application}"`, `"${m.colJ_softwareVersion}"`, `"${m.colK_industry}"`,
      `"${m.colL_thumbLink}"`, `"${m.colM_bannerLink}"`, `""`, `"${m.colO_videoLink}"`
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

  // --- Dynamic Naming Helpers ---
  const generateInitials = (courseName) => {
    if(!courseName) return "XXX";
    return courseName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  };
  const courseInitials = generateInitials(currentModule?.colB_courseName);
  const bannerNameStr = `${courseInitials}${currentModule?.colA_courseNumber || '000'}BANNER`;
  const thumbNameStr = `M[XX]${courseInitials}${currentModule?.colA_courseNumber || '000'}`;

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
                              onClick={() => { setCurrentModule(mod); setActivePhase(1); setView('editor'); }}
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
                  ].map(phase => (
                    <button
                      key={phase.num}
                      onClick={() => setActivePhase(phase.num)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activePhase === phase.num 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`${activePhase === phase.num ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {phase.icon}
                      </span>
                      <span>Phase {phase.num}</span>
                    </button>
                  ))}
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
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. CNH100.01" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Course Name (Col B) *</label>
                          <input type="text" value={currentModule.colB_courseName} onChange={(e) => handleUpdateField('colB_courseName', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. Intro to Rendering" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Module Title (Col C) *</label>
                        <p className="text-xs text-amber-600 mb-2 font-medium">Note: Transcribe exact text from Title Slide. Do NOT use file name.</p>
                        <input type="text" value={currentModule.colC_moduleTitle} onChange={(e) => handleUpdateField('colC_moduleTitle', e.target.value)}
                          className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Exact on-screen title" />
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
                        <p className="text-indigo-600 italic text-sm mt-1">"Create a description for this video that is less than 1000 characters."</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard("Create a description for this video that is less than 1000 characters.")}
                        className="bg-white border border-indigo-200 text-indigo-700 p-2 rounded-md hover:bg-indigo-100 transition shadow-sm"
                        title="Copy Prompt"
                      >
                        <Clipboard size={18} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Generated Description (Col D)</label>
                      <div className="relative">
                        <textarea 
                          value={currentModule.colD_description} 
                          onChange={(e) => handleUpdateField('colD_description', e.target.value)}
                          rows="6"
                          className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                          placeholder="Paste AI output here..." 
                        />
                        <div className={`absolute bottom-3 right-3 text-xs font-medium ${currentModule.colD_description.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                          {currentModule.colD_description.length} / 1000 chars
                        </div>
                      </div>
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">HashID (Col E)</label>
                        <input type="text" value={currentModule.colE_hashId} onChange={(e) => handleUpdateField('colE_hashId', e.target.value)}
                          className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono" placeholder="Paste HashID" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username (Col F)</label>
                        <input type="text" value={currentModule.colF_username} onChange={(e) => handleUpdateField('colF_username', e.target.value)}
                          className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Paste Username" />
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
                          <label className="block text-sm font-bold text-slate-700 mb-1">Entity Type (Col H)</label>
                          <select value={currentModule.colH_entityType} onChange={(e) => handleUpdateField('colH_entityType', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                            <option value="">Select type...</option>
                            {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Application (Col I)</label>
                          <select value={currentModule.colI_application} onChange={(e) => handleUpdateField('colI_application', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
                            <option value="">Select application...</option>
                            {APPLICATIONS.map(app => <option key={app} value={app}>{app}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Software Version (Col J)</label>
                          <input type="text" value={currentModule.colJ_softwareVersion} onChange={(e) => handleUpdateField('colJ_softwareVersion', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. 5.5" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Industry (Col K)</label>
                          <input type="text" value={currentModule.colK_industry} onChange={(e) => handleUpdateField('colK_industry', e.target.value)}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="e.g. Games, Architecture" />
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
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
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

                      {/* Banner */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input type="checkbox" checked={currentModule.p5_bannerCreated} onChange={(e) => handleUpdateField('p5_bannerCreated', e.target.checked)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-bold text-slate-800">2. Banner Generation</span>
                            <span className="block text-sm text-slate-600">Exported Slide 2 as JPEG. Target File Name:</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <code className="bg-white border border-slate-300 px-2 py-1 rounded text-sm text-indigo-700 font-mono">
                                {bannerNameStr}
                              </code>
                              <button onClick={(e) => { e.preventDefault(); copyToClipboard(bannerNameStr); }} className="text-slate-400 hover:text-indigo-600" title="Copy Filename"><Clipboard size={16}/></button>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Thumbnail */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input type="checkbox" checked={currentModule.p5_thumbCreated} onChange={(e) => handleUpdateField('p5_thumbCreated', e.target.checked)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                          <div>
                            <span className="block font-bold text-slate-800">3. Thumbnail Generation</span>
                            <span className="block text-sm text-slate-600 mb-1">Exported Slide 4 as JPEG. Target File Name format:</span>
                            <div className="flex items-center space-x-2">
                              <code className="bg-white border border-slate-300 px-2 py-1 rounded text-sm text-indigo-700 font-mono">
                                {thumbNameStr}
                              </code>
                              <button onClick={(e) => { e.preventDefault(); copyToClipboard(thumbNameStr); }} className="text-slate-400 hover:text-indigo-600" title="Copy Filename"><Clipboard size={16}/></button>
                            </div>
                            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                              Reminder: Update Purple text to <strong>{currentModule.colB_courseName || '[Course Name]'}</strong> and White text to <strong>{currentModule.colC_moduleTitle || '[Module Title]'}</strong>
                            </div>
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Module Thumbnail Link (Col L)</label>
                        <input type="url" value={currentModule.colL_thumbLink} onChange={(e) => handleUpdateField('colL_thumbLink', e.target.value)}
                          className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Google Drive Link Chip..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner Link (Col M)</label>
                        <input type="url" value={currentModule.colM_bannerLink} onChange={(e) => handleUpdateField('colM_bannerLink', e.target.value)}
                          className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Google Drive Link Chip..." />
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-indigo-700 mb-1">Video Share Link (Col O)</label>
                        <p className="text-xs text-slate-500 mb-2">Specific share link for the video file from the source VIDEOS folder.</p>
                        <input type="url" value={currentModule.colO_videoLink} onChange={(e) => handleUpdateField('colO_videoLink', e.target.value)}
                          className="w-full border border-indigo-300 bg-indigo-50 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="Paste Video Share Link here..." />
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
                  <button 
                    onClick={handleSaveModule}
                    className="flex items-center px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition shadow-sm"
                  >
                    <CheckCircle size={20} className="mr-2"/> Finish & Save
                  </button>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
