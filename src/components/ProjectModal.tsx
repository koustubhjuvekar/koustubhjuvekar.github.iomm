import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Laptop,
  Server,
  Database,
  Edit3,
  Plus,
  Trash2,
  Upload,
  Save,
  Eye,
} from 'lucide-react';
import {
  type PortfolioContentData,
  type ProjectDetailData,
  getOrCreateProjectDetail,
} from '../data/portfolioData';
import { filterLabCommands } from '../utils/portfolioLogic';
import { uploadPortfolioImage } from '../utils/cmsStorage';

interface ProjectModalProps {
  activeProject: { id: string; name: string; meta: string } | null;
  content: PortfolioContentData;
  isAdminLoggedIn: boolean;
  onSaveProjectDetail: (projectId: string, updatedDetail: ProjectDetailData) => Promise<void>;
  onRequestAdminLogin: () => void;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  activeProject,
  content,
  isAdminLoggedIn,
  onSaveProjectDetail,
  onRequestAdminLogin,
  onClose,
}) => {
  const [labTab, setLabTab] = useState<'steps' | 'commands' | 'faqs'>('steps');
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
    '03': true,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [cmdSearch, setCmdSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ProjectDetailData | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeProject) {
      const detail = getOrCreateProjectDetail(
        content,
        activeProject.id,
        activeProject.name,
        activeProject.meta
      );
      setDraft(JSON.parse(JSON.stringify(detail)));
      setIsEditing(false);
      setLabTab('steps');
      setSaveMessage(null);
    } else {
      setDraft(null);
      setIsEditing(false);
    }
  }, [activeProject, content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeProject || !draft) return null;

  const currentDetail = getOrCreateProjectDetail(
    content,
    activeProject.id,
    activeProject.name,
    activeProject.meta
  );

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1400);
  };

  const expandAllSteps = () => {
    const next: Record<string, boolean> = {};
    currentDetail.steps.forEach((s) => {
      next[s.stepNumber] = true;
    });
    setOpenSteps(next);
  };

  const collapseAllSteps = () => {
    setOpenSteps({});
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    await onSaveProjectDetail(activeProject.id, draft);
    setSaveMessage('Saved to repository folder (/data/portfolio-content.json)!');
    setTimeout(() => setSaveMessage(null), 3000);
    setIsEditing(false);
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    const uploadedPath = await uploadPortfolioImage(file);
    setDraft({ ...draft, heroImage: uploadedPath });
  };

  const handleStepImageUpload = async (
    stepIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    const uploadedPath = await uploadPortfolioImage(file);
    const nextSteps = [...draft.steps];
    nextSteps[stepIndex] = { ...nextSteps[stepIndex], image: uploadedPath };
    setDraft({ ...draft, steps: nextSteps });
  };

  const filteredCommands = filterLabCommands(currentDetail.quickCommands, cmdSearch);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0F17] shrink-0">
          <div>
            <div className="text-xs font-mono text-[#E11D48] dark:text-[#F59E0B]">
              {currentDetail.badge}
            </div>
            <h2
              id="lab-modal-title"
              className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white"
            >
              {currentDetail.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isEditing && currentDetail.layoutType === 'lab' && (
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-[#090A0F] border border-slate-300/70 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setLabTab('steps')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    labTab === 'steps'
                      ? 'bg-[#E11D48] text-white font-semibold'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  Steps ({currentDetail.steps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLabTab('commands')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    labTab === 'commands'
                      ? 'bg-[#E11D48] text-white font-semibold'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  Commands ({currentDetail.quickCommands.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLabTab('faqs')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    labTab === 'faqs'
                      ? 'bg-[#E11D48] text-white font-semibold'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  FAQs ({currentDetail.faqs.length})
                </button>
              </div>
            )}

            {/* Edit Project Button (Admin) */}
            {isAdminLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition-colors cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Mode</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Project (Steps, Photos, Commands, FAQs)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-white/15 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Admin Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.15] text-slate-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {saveMessage}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-zinc-300">
          {isEditing ? (
            /* ADMIN PROJECT EDITOR */
            <div className="space-y-8">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    1. Project Overview &amp; Header Photo
                  </h3>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Project to Repo Folder</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Project Title</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Badge / Tech Tags</label>
                    <input
                      type="text"
                      value={draft.badge}
                      onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Layout Type</label>
                    <select
                      value={draft.layoutType}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          layoutType: e.target.value as 'lab' | 'architecture',
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                    >
                      <option value="lab">Step-by-Step Practical Guide + Commands + FAQs</option>
                      <option value="architecture">3-Tier / Architecture Layers</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Goal / Overview Heading</label>
                    <input
                      type="text"
                      value={draft.goalHeading}
                      onChange={(e) => setDraft({ ...draft, goalHeading: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Overview Photo Path or Upload
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={draft.heroImage || ''}
                        onChange={(e) => setDraft({ ...draft, heroImage: e.target.value })}
                        placeholder="/images/webserver/goal.png"
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                      <label className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Goal / Overview Description</label>
                  <textarea
                    rows={2}
                    value={draft.goalDescription}
                    onChange={(e) => setDraft({ ...draft, goalDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Cloud Engineer Note</label>
                  <textarea
                    rows={2}
                    value={draft.engineerNote}
                    onChange={(e) => setDraft({ ...draft, engineerNote: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* 2. Steps Editor */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    2. Step-by-Step Guide ({draft.steps.length} Steps)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = String(draft.steps.length + 1).padStart(2, '0');
                      setDraft({
                        ...draft,
                        steps: [
                          ...draft.steps,
                          {
                            stepNumber: nextNum,
                            title: `Step ${nextNum}`,
                            description: 'Describe what happens in this step.',
                            commands: [],
                            image: '',
                          },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48] text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {draft.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-4 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={step.stepNumber}
                            onChange={(e) => {
                              const next = [...draft.steps];
                              next[sIdx] = { ...step, stepNumber: e.target.value };
                              setDraft({ ...draft, steps: next });
                            }}
                            className="w-16 px-2.5 py-1.5 text-xs font-mono font-bold rounded bg-slate-100 dark:bg-[#151824] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const next = [...draft.steps];
                              next[sIdx] = { ...step, title: e.target.value };
                              setDraft({ ...draft, steps: next });
                            }}
                            placeholder="Step Title"
                            className="flex-1 px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 dark:bg-[#151824] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = draft.steps.filter((_, i) => i !== sIdx);
                            setDraft({ ...draft, steps: next });
                          }}
                          className="p-1.5 rounded bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={step.description}
                        onChange={(e) => {
                          const next = [...draft.steps];
                          next[sIdx] = { ...step, description: e.target.value };
                          setDraft({ ...draft, steps: next });
                        }}
                        placeholder="Step description..."
                        className="w-full px-3 py-1.5 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={step.image || ''}
                          onChange={(e) => {
                            const next = [...draft.steps];
                            next[sIdx] = { ...step, image: e.target.value };
                            setDraft({ ...draft, steps: next });
                          }}
                          placeholder="Step Photo URL (/images/webserver/image1.png)"
                          className="flex-1 px-3 py-1.5 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                        <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleStepImageUpload(sIdx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Step Commands */}
                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-slate-500">
                            Step CLI Commands ({(step.commands || []).length})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...draft.steps];
                              const cmds = [...(step.commands || [])];
                              cmds.push({ label: 'Command', code: 'sudo yum update -y', meaning: '' });
                              next[sIdx] = { ...step, commands: cmds };
                              setDraft({ ...draft, steps: next });
                            }}
                            className="text-xs font-semibold text-[#E11D48] dark:text-[#F59E0B] hover:underline cursor-pointer"
                          >
                            + Add Command to Step
                          </button>
                        </div>

                        {(step.commands || []).map((cmd, cIdx) => (
                          <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              value={cmd.code}
                              onChange={(e) => {
                                const next = [...draft.steps];
                                const cmds = [...(step.commands || [])];
                                cmds[cIdx] = { ...cmd, code: e.target.value };
                                next[sIdx] = { ...step, commands: cmds };
                                setDraft({ ...draft, steps: next });
                              }}
                              placeholder="CLI Command"
                              className="sm:col-span-6 px-2.5 py-1 text-xs font-mono rounded bg-slate-900 text-amber-300 border border-white/10"
                            />
                            <input
                              type="text"
                              value={cmd.meaning || ''}
                              onChange={(e) => {
                                const next = [...draft.steps];
                                const cmds = [...(step.commands || [])];
                                cmds[cIdx] = { ...cmd, meaning: e.target.value };
                                next[sIdx] = { ...step, commands: cmds };
                                setDraft({ ...draft, steps: next });
                              }}
                              placeholder="Meaning / Explanation"
                              className="sm:col-span-5 px-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...draft.steps];
                                const cmds = (step.commands || []).filter((_, i) => i !== cIdx);
                                next[sIdx] = { ...step, commands: cmds };
                                setDraft({ ...draft, steps: next });
                              }}
                              className="sm:col-span-1 p-1 text-rose-500 hover:underline text-xs cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Quick Reference Commands Editor */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    3. Quick Reference CLI Commands ({draft.quickCommands.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNum = String(draft.quickCommands.length + 1).padStart(2, '0');
                      setDraft({
                        ...draft,
                        quickCommands: [
                          ...draft.quickCommands,
                          { num: nextNum, command: '', purpose: '' },
                        ],
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48] text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Quick Command</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draft.quickCommands.map((qc, qIdx) => (
                    <div
                      key={qIdx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10"
                    >
                      <input
                        type="text"
                        value={qc.num}
                        onChange={(e) => {
                          const next = [...draft.quickCommands];
                          next[qIdx] = { ...qc, num: e.target.value };
                          setDraft({ ...draft, quickCommands: next });
                        }}
                        className="sm:col-span-1 px-2 py-1 text-xs font-mono font-bold rounded bg-slate-100 dark:bg-[#151824]"
                      />
                      <input
                        type="text"
                        value={qc.command}
                        onChange={(e) => {
                          const next = [...draft.quickCommands];
                          next[qIdx] = { ...qc, command: e.target.value };
                          setDraft({ ...draft, quickCommands: next });
                        }}
                        placeholder="Command (e.g. sudo systemctl start httpd)"
                        className="sm:col-span-5 px-2.5 py-1 text-xs font-mono rounded bg-slate-900 text-amber-300"
                      />
                      <input
                        type="text"
                        value={qc.purpose}
                        onChange={(e) => {
                          const next = [...draft.quickCommands];
                          next[qIdx] = { ...qc, purpose: e.target.value };
                          setDraft({ ...draft, quickCommands: next });
                        }}
                        placeholder="Purpose of this command"
                        className="sm:col-span-5 px-2.5 py-1 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = draft.quickCommands.filter((_, i) => i !== qIdx);
                          setDraft({ ...draft, quickCommands: next });
                        }}
                        className="sm:col-span-1 p-1.5 text-rose-500 hover:bg-rose-500/15 rounded flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FAQs Editor */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    4. Project FAQs ({draft.faqs.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        faqs: [
                          ...draft.faqs,
                          { question: 'New Question?', answer: 'Detailed explanation...', codeSnippet: '' },
                        ],
                      })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48] text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const next = [...draft.faqs];
                            next[fIdx] = { ...faq, question: e.target.value };
                            setDraft({ ...draft, faqs: next });
                          }}
                          placeholder="Question"
                          className="flex-1 px-3 py-1.5 text-xs font-semibold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = draft.faqs.filter((_, i) => i !== fIdx);
                            setDraft({ ...draft, faqs: next });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/15 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const next = [...draft.faqs];
                          next[fIdx] = { ...faq, answer: e.target.value };
                          setDraft({ ...draft, faqs: next });
                        }}
                        placeholder="Answer"
                        className="w-full px-3 py-1.5 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                      />
                      <input
                        type="text"
                        value={faq.codeSnippet || ''}
                        onChange={(e) => {
                          const next = [...draft.faqs];
                          next[fIdx] = { ...faq, codeSnippet: e.target.value };
                          setDraft({ ...draft, faqs: next });
                        }}
                        placeholder="Optional Code Snippet"
                        className="w-full px-3 py-1.5 text-xs font-mono rounded bg-slate-900 text-amber-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Architecture Cards Editor */}
              {draft.layoutType === 'architecture' && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      5. Architecture Layers ({draft.architectureCards.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          architectureCards: [
                            ...draft.architectureCards,
                            {
                              title: 'New Tier',
                              tag: 'Layer Role',
                              description: 'Layer description...',
                            },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48] text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Layer</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {draft.architectureCards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const next = [...draft.architectureCards];
                              next[cIdx] = { ...card, title: e.target.value };
                              setDraft({ ...draft, architectureCards: next });
                            }}
                            className="w-full px-2 py-1 text-xs font-bold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = draft.architectureCards.filter((_, i) => i !== cIdx);
                              setDraft({ ...draft, architectureCards: next });
                            }}
                            className="ml-2 p-1 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={card.tag}
                          onChange={(e) => {
                            const next = [...draft.architectureCards];
                            next[cIdx] = { ...card, tag: e.target.value };
                            setDraft({ ...draft, architectureCards: next });
                          }}
                          className="w-full px-2 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />
                        <textarea
                          rows={3}
                          value={card.description}
                          onChange={(e) => {
                            const next = [...draft.architectureCards];
                            next[cIdx] = { ...card, description: e.target.value };
                            setDraft({ ...draft, architectureCards: next });
                          }}
                          className="w-full px-2 py-1 text-xs rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-white/15 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Project Changes</span>
                </button>
              </div>
            </div>
          ) : currentDetail.layoutType === 'architecture' ? (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {currentDetail.goalHeading}
                </h3>
                <p className="text-slate-600 dark:text-zinc-400">
                  {currentDetail.goalDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentDetail.architectureCards.map((card, idx) => (
                  <div
                    key={`${card.title}-${idx}`}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-3 text-center"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#E11D48]/10 text-[#E11D48] dark:text-[#F59E0B] flex items-center justify-center">
                      {idx % 3 === 0 && <Laptop className="w-6 h-6" />}
                      {idx % 3 === 1 && <Server className="w-6 h-6" />}
                      {idx % 3 === 2 && <Database className="w-6 h-6" />}
                    </div>
                    <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </h4>
                    <div className="text-xs font-mono text-[#E11D48] dark:text-[#F59E0B]">
                      {card.tag}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Overview Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10">
                <div className={currentDetail.heroImage ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {currentDetail.goalHeading}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {currentDetail.goalDescription}
                  </p>
                  {currentDetail.engineerNote && (
                    <div className="p-3 rounded-lg bg-white dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 text-xs">
                      <strong className="text-slate-900 dark:text-white">
                        Cloud Engineer perspective:
                      </strong>{' '}
                      {currentDetail.engineerNote}
                    </div>
                  )}
                </div>
                {currentDetail.heroImage && (
                  <div className="lg:col-span-5">
                    <img
                      src={currentDetail.heroImage}
                      alt={currentDetail.title}
                      className="w-full h-48 object-contain rounded-lg bg-white p-2 border border-slate-200 dark:border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Tab Switcher */}
              <div className="flex sm:hidden items-center gap-1 p-1 rounded-lg bg-slate-200 dark:bg-[#090A0F]">
                <button
                  type="button"
                  onClick={() => setLabTab('steps')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                    labTab === 'steps' ? 'bg-[#E11D48] text-white' : ''
                  }`}
                >
                  Steps ({currentDetail.steps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLabTab('commands')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                    labTab === 'commands' ? 'bg-[#E11D48] text-white' : ''
                  }`}
                >
                  Commands ({currentDetail.quickCommands.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLabTab('faqs')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md ${
                    labTab === 'faqs' ? 'bg-[#E11D48] text-white' : ''
                  }`}
                >
                  FAQs ({currentDetail.faqs.length})
                </button>
              </div>

              {labTab === 'steps' && (
                <div className="space-y-4">
                  {currentDetail.steps.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                          {currentDetail.title} — Step by Step
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={expandAllSteps}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-white/[0.08] text-slate-800 dark:text-white cursor-pointer"
                          >
                            + Expand All
                          </button>
                          <button
                            type="button"
                            onClick={collapseAllSteps}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            − Close All
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {currentDetail.steps.map((step) => {
                          const isOpen = !!openSteps[step.stepNumber];
                          return (
                            <div
                              key={step.stepNumber}
                              className="rounded-xl bg-slate-50 dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSteps((prev) => ({
                                    ...prev,
                                    [step.stepNumber]: !prev[step.stepNumber],
                                  }))
                                }
                                aria-expanded={isOpen}
                                className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs font-bold text-[#E11D48] dark:text-[#F59E0B] tabular-nums">
                                    {step.stepNumber}
                                  </span>
                                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {step.title}
                                  </span>
                                </div>
                                {isOpen ? (
                                  <ChevronUp className="w-4 h-4 text-slate-500" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-500" />
                                )}
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-3">
                                  <p className="text-xs sm:text-sm">{step.description}</p>

                                  {step.ports && step.ports.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {step.ports.map((p) => (
                                        <div
                                          key={p.port}
                                          className="p-3 rounded-lg bg-white dark:bg-[#151824] border border-slate-200 dark:border-white/10"
                                        >
                                          <div className="font-mono text-base font-bold text-[#E11D48] dark:text-[#F59E0B]">
                                            Port {p.port} · {p.protocol}
                                          </div>
                                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                                            {p.purpose}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {step.commands && step.commands.length > 0 && (
                                    <div className="space-y-2">
                                      {step.commands.map((cmd, cIdx) => {
                                        const copyId = `step-${step.stepNumber}-${cIdx}`;
                                        return (
                                          <div
                                            key={copyId}
                                            className="p-3 rounded-lg bg-slate-900 text-zinc-100 space-y-1.5"
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="text-[11px] font-mono text-zinc-400">
                                                {cmd.label || 'Command'}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleCopy(cmd.code, copyId)}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                                              >
                                                {copiedKey === copyId ? (
                                                  <>
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    <span>Copied</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy</span>
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                            <code className="block font-mono text-xs text-amber-300">
                                              {cmd.code}
                                            </code>
                                            {cmd.meaning && (
                                              <p className="text-[11px] text-zinc-400">
                                                Meaning: {cmd.meaning}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {step.infoNote && (
                                    <div className="p-3 rounded-lg bg-white dark:bg-[#151824] border border-slate-200 dark:border-white/10 text-xs">
                                      {step.infoNote}
                                    </div>
                                  )}

                                  {step.image && (
                                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-black/20">
                                      <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full max-h-72 object-contain mx-auto"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 rounded-xl bg-slate-50 dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 text-center space-y-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        No steps added yet for {currentDetail.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {isAdminLoggedIn
                          ? 'Click "Edit Project (Steps, Photos, Commands, FAQs)" above to add steps, upload photos, commands, and FAQs.'
                          : 'Log in via the Admin button in the bottom corner to add steps, screenshots, commands, and FAQs to this project.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {labTab === 'commands' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Important Commands at a Glance
                    </span>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cmdSearch}
                        onChange={(e) => setCmdSearch(e.target.value)}
                        placeholder="Search commands..."
                        aria-label="Search commands"
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#090A0F] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {filteredCommands.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0D0F17]">
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Command</th>
                            <th className="py-2.5 px-3">Purpose</th>
                            <th className="py-2.5 px-3 text-right">Copy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                          {filteredCommands.map((c) => {
                            const key = `cmd-${c.num}`;
                            return (
                              <tr key={c.num}>
                                <td className="py-2.5 px-3 font-mono font-bold text-[#E11D48] dark:text-[#F59E0B]">
                                  {c.num}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-amber-200">
                                  {c.command}
                                </td>
                                <td className="py-2.5 px-3">{c.purpose}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(c.command, key)}
                                    className="px-2.5 py-1 font-mono rounded bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white cursor-pointer"
                                  >
                                    {copiedKey === key ? 'Copied' : 'Copy'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-slate-50 dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500">
                      No CLI commands recorded yet. Use Admin Edit mode to add commands.
                    </div>
                  )}
                </div>
              )}

              {labTab === 'faqs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDetail.faqs.length > 0 ? (
                    currentDetail.faqs.map((faq, idx) => (
                      <div
                        key={`${faq.question}-${idx}`}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-[#E11D48] dark:text-[#F59E0B] shrink-0 mt-0.5" />
                          <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {String(idx + 1).padStart(2, '0')}. {faq.question}
                          </h4>
                        </div>
                        <p className="text-xs leading-relaxed">{faq.answer}</p>
                        {faq.codeSnippet && (
                          <pre className="p-2 rounded bg-slate-900 text-amber-200 font-mono text-xs overflow-x-auto">
                            {faq.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 rounded-xl bg-slate-50 dark:bg-[#0D0F17] border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500">
                      No FAQs added yet. Use Admin Edit mode to add FAQs for this project.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
