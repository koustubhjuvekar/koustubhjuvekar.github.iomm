import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, User, ArrowRight, Github, Linkedin, Edit3 } from 'lucide-react';
import { type ProfileData, type FeaturedCaseStudy } from '../data/portfolioData';

interface HeroSectionProps {
  profile: ProfileData;
  featuredAboutProjects: FeaturedCaseStudy[];
  onOpenResume: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminSection: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  featuredAboutProjects,
  onOpenResume,
  isAdminLoggedIn,
  onOpenAdminSection,
}) => {
  const phrases = [
    profile.typedHeadline || 'I am AWS Cloud and DevOps Engineer!',
    profile.typedSecondary || 'AWS Cloud • Docker • Kubernetes • CI/CD',
  ];

  const [displayText, setDisplayText] = useState(phrases[0]);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(phrases[0].length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const activePhrases = [
      profile.typedHeadline || 'I am AWS Cloud and DevOps Engineer!',
      profile.typedSecondary || 'AWS Cloud • Docker • Kubernetes • CI/CD',
    ];
    const currentFull = activePhrases[phraseIdx % activePhrases.length];
    const timeout = setTimeout(
      () => {
        if (!isDeleting && charIdx < currentFull.length) {
          const next = charIdx + 1;
          setCharIdx(next);
          setDisplayText(currentFull.slice(0, next));
        } else if (!isDeleting && charIdx >= currentFull.length) {
          setIsDeleting(true);
        } else if (isDeleting && charIdx > 0) {
          const next = charIdx - 1;
          setCharIdx(next);
          setDisplayText(currentFull.slice(0, next));
        } else if (isDeleting && charIdx === 0) {
          setIsDeleting(false);
          const nextPhrase = (phraseIdx + 1) % activePhrases.length;
          setPhraseIdx(nextPhrase);
        }
      },
      !isDeleting && charIdx >= currentFull.length ? 2400 : isDeleting ? 30 : 55
    );

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, phraseIdx, profile.typedHeadline, profile.typedSecondary]);

  const renderHighlightedTyped = (text: string) => {
    const parts = text.split(/(AWS Cloud|DevOps)/g);
    return parts.map((part, idx) => {
      if (part === 'AWS Cloud') {
        return (
          <span key={idx} className="text-[#EA580C] dark:text-[#F59E0B]">
            {part}
          </span>
        );
      }
      if (part === 'DevOps') {
        return (
          <span key={idx} className="text-[#2563EB] dark:text-[#3B82F6]">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const linkedinSocial = profile.socials.find((s) =>
    s.name.toLowerCase().includes('linkedin')
  );
  const githubSocial = profile.socials.find((s) =>
    s.name.toLowerCase().includes('github')
  );

  return (
    <>
      {/* HERO SECTION (#header) — Wilson Kinyua Inspired Split with Photo on Top */}
      <section
        id="header"
        className="relative pt-10 pb-16 md:pt-14 md:pb-20 bg-slate-50 dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/[0.08] transition-colors overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          {isAdminLoggedIn && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => onOpenAdminSection('profile')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Hero &amp; Profile</span>
              </button>
            </div>
          )}

          {/* Main Hero Split: Photo on Top on Mobile (order-first), Right on Desktop (lg:order-last) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, Typed Text, Bio & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-7 space-y-6 order-last lg:order-first"
            >
              <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B]">
                {profile.heroTagline}
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] min-h-[2.4em] sm:min-h-[2.25em]"
                style={{ textWrap: 'balance' }}
              >
                {renderHighlightedTyped(displayText)}
                <span className="inline-block w-0.5 h-8 sm:h-11 ml-1 align-middle bg-[#E11D48] dark:bg-[#F59E0B]" />
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-zinc-300 font-medium">
                {profile.heroSubtitle}
              </p>

              {/* Highlight Callout Box */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 shadow-xs">
                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {profile.heroHighlightText}
                </p>
              </div>

              {/* Primary CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
                >
                  <span>Hire Me</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-4 h-4 text-[#E11D48] dark:text-[#F59E0B]" />
                  <span>Contact Me</span>
                </a>

                <button
                  type="button"
                  onClick={onOpenResume}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:text-[#E11D48] dark:hover:text-[#F59E0B] bg-slate-200/70 dark:bg-white/[0.04] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>See My Resume</span>
                </button>
              </div>

              {/* LinkedIn & GitHub Quick Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {linkedinSocial && (
                  <a
                    href={linkedinSocial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Koustubh Juvekar LinkedIn Profile"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#151824] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-colors"
                  >
                    <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {githubSocial && (
                  <a
                    href={githubSocial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Koustubh Juvekar GitHub Profile"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#151824] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 hover:border-[#E11D48] dark:hover:border-[#F59E0B] transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Right Column (and Top on Mobile): Koustubh's Portrait in Wilson Kinyua Circular Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 flex justify-center order-first lg:order-last"
            >
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 lg:w-96 lg:h-96 flex items-center justify-center">
                <div className="absolute inset-3 rounded-full border-4 border-[#E11D48] dark:border-[#E11D48] bg-gradient-to-b from-slate-900 via-[#18181B] to-[#E11D48]/30 shadow-2xl overflow-hidden">
                  <img
                    src={profile.portraitImage}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[76%_top] scale-105 hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -bottom-2 px-5 py-2 rounded-xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-white/15 shadow-lg text-center">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {profile.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#E11D48] dark:text-[#F59E0B]">
                    {profile.portraitRoleBadge}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (#about) */}
      <section
        id="about"
        className="py-16 bg-white dark:bg-[#0F1118] border-b border-slate-200 dark:border-white/[0.08] transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6 space-y-12">
          {isAdminLoggedIn && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onOpenAdminSection('about')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit About &amp; Featured Projects</span>
              </button>
            </div>
          )}

          {/* Greeting & Bio */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto text-center space-y-4"
          >
            <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B]">
              About Me
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {profile.aboutGreeting}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed italic font-serif-editorial">
              “{profile.aboutBio}”
            </p>
          </motion.div>

          {/* Featured Case Study Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredAboutProjects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 hover:border-[#E11D48]/60 dark:hover:border-[#F59E0B]/60 transition-colors space-y-4 shadow-xs"
              >
                <div className="text-xs font-mono text-[#E11D48] dark:text-[#F59E0B]">
                  {String(idx + 1).padStart(2, '0')} · Featured Implementation
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {proj.title}
                </h3>
                <div className="space-y-1.5 text-sm text-slate-600 dark:text-zinc-300">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Description:
                  </div>
                  <p className="leading-relaxed">{proj.description}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Responsibilities:
                  </div>
                  <ul className="space-y-1.5">
                    {proj.responsibilities.map((item, rIdx) => (
                      <li key={`${proj.id}-resp-${rIdx}`} className="flex items-start gap-2.5">
                        <span className="text-[#E11D48] dark:text-[#F59E0B] font-mono">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
