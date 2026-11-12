import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
} from 'lucide-react';
import {
  type ProjectCategoryCard,
  type SubProjectItem,
} from '../data/portfolioData';
import {
  getVisibleCategories,
  getVisibleSubProjects,
} from '../utils/portfolioLogic';

interface ProjectsSectionProps {
  categories: ProjectCategoryCard[];
  onOpenProjectDetail: (project: {
    id: string;
    name: string;
    meta: string;
  }) => void;
  isAdminLoggedIn: boolean;
  onOpenAdminSection: (tab: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  categories,
  onOpenProjectDetail,
  isAdminLoggedIn,
  onOpenAdminSection,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    aws: true,
    devops: true,
  });
  const [showAllAwsItems, setShowAllAwsItems] = useState(false);
  const [openDevopsTech, setOpenDevopsTech] = useState<Record<string, boolean>>({
    Docker: true,
    Kubernetes: false,
  });

  const handleProjectClick = (item: SubProjectItem) => {
    onOpenProjectDetail({
      id: item.id,
      name: item.name,
      meta: item.meta,
    });
  };

  const visibleCategories = getVisibleCategories(
    categories,
    showAllCategories,
    4
  );

  return (
    <section
      id="projects"
      className="py-16 bg-slate-50 dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/[0.08] transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        {/* Section Header (without the removed practical shortcut pills or Last Visited bar) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B] mb-2">
              Project Library
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              My <span className="text-[#E11D48] dark:text-[#F59E0B]">Projects</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl">
              A structured collection of cloud, DevOps, automation, CI/CD and infrastructure projects. Select a technology to expand its project list, or click any project to view its practical guide.
            </p>
          </div>

          {isAdminLoggedIn && (
            <button
              type="button"
              onClick={() => onOpenAdminSection('projects')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer self-start md:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Project Categories &amp; Items</span>
            </button>
          )}
        </div>

        {/* Categorized Technology Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {visibleCategories.map((cat) => {
            const isExpanded = !!expandedCards[cat.id];
            const isAws = cat.id === 'aws';
            const visibleProjects = cat.projects
              ? isAws
                ? getVisibleSubProjects(cat.projects, showAllAwsItems, 4)
                : cat.projects
              : [];

            return (
              <motion.article
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden"
              >
                {/* Category Header Toggle Button */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCards((prev) => ({
                      ...prev,
                      [cat.id]: !prev[cat.id],
                    }))
                  }
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#1C2030] border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shrink-0">
                      <img
                        src={cat.iconUrl}
                        alt={cat.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {cat.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-zinc-300 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Expandable Project List */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-200/80 dark:border-white/[0.07] space-y-3">
                    {cat.description && (
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        {cat.description}
                      </p>
                    )}

                    {/* Standard Project Items List */}
                    {cat.projects && (
                      <div className="space-y-2">
                        {visibleProjects.map((proj) => (
                          <button
                            key={proj.id}
                            type="button"
                            onClick={() => handleProjectClick(proj)}
                            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0B0C10] hover:bg-slate-100 dark:hover:bg-[#1A1E2E] border border-slate-200/80 dark:border-white/[0.07] text-left transition-colors cursor-pointer group"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#E11D48] dark:group-hover:text-[#F59E0B] transition-colors">
                                {proj.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                {proj.meta}
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B] shrink-0">
                              Open →
                            </span>
                          </button>
                        ))}

                        {/* See More inside AWS Projects (10 items total) */}
                        {isAws && cat.projects.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setShowAllAwsItems((prev) => !prev)}
                            className="w-full py-2 text-xs font-semibold text-[#E11D48] dark:text-[#F59E0B] hover:underline cursor-pointer text-center"
                          >
                            {showAllAwsItems
                              ? 'Show Less AWS Projects'
                              : `See More AWS Projects (+${cat.projects.length - 4} More)`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* DevOps Nested Sub-Groups (Docker & Kubernetes) */}
                    {cat.subGroups && (
                      <div className="space-y-2.5">
                        {cat.subGroups.map((sub) => {
                          const isSubOpen = !!openDevopsTech[sub.name];
                          return (
                            <div
                              key={sub.name}
                              className="rounded-xl bg-slate-50 dark:bg-[#0B0C10] border border-slate-200/80 dark:border-white/[0.07] overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDevopsTech((prev) => ({
                                    ...prev,
                                    [sub.name]: !prev[sub.name],
                                  }))
                                }
                                aria-expanded={isSubOpen}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                              >
                                <span>{sub.name}</span>
                                <span className="text-xs font-mono text-[#E11D48] dark:text-[#F59E0B]">
                                  {isSubOpen ? '−' : '+'}
                                </span>
                              </button>

                              {isSubOpen && (
                                <div className="px-4 pb-3 pt-1 border-t border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
                                  {sub.items.map((miniItem, mIdx) => {
                                    const subProjId = `devops-${sub.name.toLowerCase()}-${mIdx + 1}`;
                                    return (
                                      <button
                                        key={miniItem}
                                        type="button"
                                        onClick={() =>
                                          onOpenProjectDetail({
                                            id: subProjId,
                                            name: miniItem,
                                            meta: `${sub.name} • DevOps`,
                                          })
                                        }
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-[#141722] hover:bg-slate-100 dark:hover:bg-[#1C2133] border border-slate-200/60 dark:border-white/[0.05] text-xs font-medium text-slate-700 dark:text-zinc-300 text-left transition-colors cursor-pointer group"
                                      >
                                        <span className="group-hover:text-[#E11D48] dark:group-hover:text-[#F59E0B] transition-colors">
                                          {miniItem}
                                        </span>
                                        <span className="font-mono text-[11px] text-[#E11D48] dark:text-[#F59E0B]">
                                          Open →
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        {/* Main "See More Projects" Button for Remaining Technology Categories */}
        {categories.length > 4 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              {showAllCategories ? (
                <>
                  <span>Show Less Categories</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>
                    See More Projects (+{categories.length - 4} More Technologies)
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
