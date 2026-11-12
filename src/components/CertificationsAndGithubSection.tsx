import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  ExternalLink,
  Star,
  GitFork,
  Edit3,
} from 'lucide-react';
import {
  type CertificateBannerItem,
  type ServiceItem,
  type ProfileData,
} from '../data/portfolioData';
import { nextCertificateIndex } from '../utils/portfolioLogic';

interface GithubProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  created_at: string;
  html_url: string;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

const DEFAULT_GH_PROFILE: GithubProfile = {
  avatar_url: '/images/favicon2.png',
  name: 'Koustubh Juvekar',
  login: 'koustubhjuvekar',
  bio: 'Passionate Developer',
  followers: 15,
  following: 20,
  public_repos: 12,
  location: 'Pune, India',
  created_at: '2022-01-15T00:00:00Z',
  html_url: 'https://github.com/koustubhjuvekar',
};

const DEFAULT_GH_REPOS: GithubRepo[] = [
  {
    id: 1,
    name: 'koustubhjuvekar.github.io',
    description: 'Personal Cloud & DevOps Engineer Portfolio Website',
    html_url: 'https://github.com/koustubhjuvekar/koustubhjuvekar.github.io',
    stargazers_count: 4,
    forks_count: 1,
    language: 'HTML',
  },
  {
    id: 2,
    name: 'aws-cloud-deployment',
    description: 'Cloud infrastructure deployment using AWS VPC, EC2, ALB and RDS.',
    html_url: 'https://github.com/koustubhjuvekar',
    stargazers_count: 3,
    forks_count: 1,
    language: 'Shell',
  },
];

interface CertificationsAndGithubProps {
  certificates: CertificateBannerItem[];
  services: ServiceItem[];
  profile: ProfileData;
  isAdminLoggedIn: boolean;
  onOpenAdminSection: (tab: string) => void;
}

export const CertificationsAndGithubSection: React.FC<
  CertificationsAndGithubProps
> = ({
  certificates,
  services,
  profile,
  isAdminLoggedIn,
  onOpenAdminSection,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxCert, setLightboxCert] = useState<CertificateBannerItem | null>(null);
  const [ghProfile, setGhProfile] = useState<GithubProfile>(DEFAULT_GH_PROFILE);
  const [ghRepos, setGhRepos] = useState<GithubRepo[]>(DEFAULT_GH_REPOS);

  const safeCertificates =
    certificates.length > 0
      ? certificates
      : [
          {
            id: 'google-cyber',
            title: 'Google Cybersecurity Certificate',
            alt: 'Google Certificate',
            image: '/images/googlecyber.jpg',
          },
        ];

  useEffect(() => {
    if (isPaused || lightboxCert || safeCertificates.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        nextCertificateIndex(prev, safeCertificates.length, 'next')
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, lightboxCert, safeCertificates.length]);

  useEffect(() => {
    let mounted = true;
    const username = profile.githubUsername || 'koustubhjuvekar';

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (mounted && user && user.login) {
          setGhProfile({
            avatar_url: user.avatar_url || DEFAULT_GH_PROFILE.avatar_url,
            name: user.name || user.login,
            login: user.login,
            bio: user.bio || 'Passionate Developer',
            followers: typeof user.followers === 'number' ? user.followers : 0,
            following: typeof user.following === 'number' ? user.following : 0,
            public_repos: typeof user.public_repos === 'number' ? user.public_repos : 0,
            location: user.location || 'Pune, India',
            created_at: user.created_at || DEFAULT_GH_PROFILE.created_at,
            html_url: user.html_url || DEFAULT_GH_PROFILE.html_url,
          });
        }
      })
      .catch(() => {});

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=4`)
      .then((res) => (res.ok ? res.json() : null))
      .then((repos) => {
        if (mounted && Array.isArray(repos) && repos.length > 0) {
          setGhRepos(
            repos.slice(0, 4).map((r: any, idx: number) => ({
              id: r.id || idx + 1,
              name: r.name || 'repository',
              description: r.description || 'No description available.',
              html_url: r.html_url || 'https://github.com/koustubhjuvekar',
              stargazers_count: typeof r.stargazers_count === 'number' ? r.stargazers_count : 0,
              forks_count: typeof r.forks_count === 'number' ? r.forks_count : 0,
              language: r.language || 'N/A',
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [profile.githubUsername]);

  const currentCert =
    safeCertificates[activeSlide % safeCertificates.length] || safeCertificates[0];

  return (
    <>
      {/* CERTIFICATES BANNER SECTION (#certificates) */}
      <section
        id="certificates"
        className="py-16 bg-white dark:bg-[#0F1118] border-b border-slate-200 dark:border-white/[0.08] transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B]">
                Verified Credentials
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                My Certifications
              </h2>
            </div>

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => onOpenAdminSection('certificates')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Certificates Banner</span>
              </button>
            )}
          </div>

          {/* Interactive Banner Carousel */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative rounded-2xl bg-slate-900 dark:bg-[#08090E] border border-slate-300 dark:border-white/15 p-6 sm:p-10 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCert.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center text-center space-y-4 w-full"
                >
                  <div
                    onClick={() => setLightboxCert(currentCert)}
                    className="relative group cursor-pointer rounded-xl overflow-hidden border border-white/15 bg-black/40 p-2 max-w-2xl w-full flex items-center justify-center"
                  >
                    <img
                      src={currentCert.image}
                      alt={currentCert.alt}
                      referrerPolicy="no-referrer"
                      className="max-h-[330px] w-auto object-contain rounded-lg mx-auto"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      {currentCert.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setLightboxCert(currentCert)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>View Fullscreen</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Banner Previous / Next Controls */}
            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) =>
                  nextCertificateIndex(prev, safeCertificates.length, 'prev')
                )
              }
              aria-label="Previous certificate"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#E11D48] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSlide((prev) =>
                  nextCertificateIndex(prev, safeCertificates.length, 'next')
                )
              }
              aria-label="Next certificate"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-[#E11D48] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Banner Slide Indicator Dots */}
            <div className="flex items-center justify-center gap-2.5 mt-6">
              {safeCertificates.map((cert, idx) => (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  aria-label={`Show ${cert.title}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    activeSlide % safeCertificates.length === idx
                      ? 'w-8 bg-[#E11D48]'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION (#services — "What I can do for you?") */}
      <section
        id="services"
        className="py-16 bg-slate-50 dark:bg-[#0B0C10] border-b border-slate-200 dark:border-white/[0.08] transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6 space-y-10">
          {isAdminLoggedIn && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onOpenAdminSection('services')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Services</span>
              </button>
            </div>
          )}

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B]">
              Services
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              What I can do for you?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
              {profile.servicesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 hover:border-[#E11D48]/60 dark:hover:border-[#F59E0B]/60 transition-colors flex flex-col items-center text-center space-y-4 shadow-xs"
              >
                <div className="h-20 flex items-center justify-center p-2">
                  <img
                    src={service.icon}
                    alt={service.title}
                    referrerPolicy="no-referrer"
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GITHUB SECTION (#github) */}
      <section
        id="github"
        className="py-16 bg-white dark:bg-[#0F1118] border-b border-slate-200 dark:border-white/[0.08] transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B]">
                Open Source
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                GitHub Profile &amp; Contributions
              </h2>
            </div>

            <a
              href={ghProfile.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/15 rounded-lg transition-colors"
            >
              <span>@{ghProfile.login}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Profile Info Block */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={ghProfile.avatar_url}
                  alt={ghProfile.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/favicon2.png';
                  }}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#E11D48]"
                />
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {ghProfile.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    {ghProfile.bio}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10 font-mono">
                <div>
                  Followers: <strong>{ghProfile.followers}</strong> · Following:{' '}
                  <strong>{ghProfile.following}</strong>
                </div>
                <div>
                  Public Repos: <strong>{ghProfile.public_repos}</strong> · Location:{' '}
                  <strong>{ghProfile.location}</strong>
                </div>
              </div>

              {/* Latest Repositories */}
              <div className="space-y-2 pt-2">
                {ghRepos.slice(0, 2).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl bg-white dark:bg-[#0D0F17] border border-slate-200 dark:border-white/[0.08] hover:border-[#E11D48] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{repo.name}</span>
                      <span className="font-mono text-slate-500 dark:text-zinc-400">
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-1">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400 mt-2 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        {repo.stargazers_count}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contributions Activity Graph Block */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Contributions Activity
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  github.com/{ghProfile.login}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-[#0D1117] p-5 border border-slate-200 dark:border-white/10 space-y-4">
                <svg
                  viewBox="0 0 600 160"
                  className="w-full h-36 overflow-visible"
                  role="img"
                  aria-label="Koustubh Juvekar GitHub Contribution Graph"
                >
                  <defs>
                    <linearGradient id="ghGraphFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E11D48" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {[30, 65, 100, 135].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="600"
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-white/10"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  ))}
                  <path
                    d="M 0 130 C 50 115, 90 75, 140 85 C 190 95, 230 45, 280 55 C 330 65, 370 95, 420 60 C 470 25, 530 70, 600 40 L 600 150 L 0 150 Z"
                    fill="url(#ghGraphFill)"
                  />
                  <path
                    d="M 0 130 C 50 115, 90 75, 140 85 C 190 95, 230 45, 280 55 C 330 65, 370 95, 420 60 C 470 25, 530 70, 600 40"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {[
                    [0, 130],
                    [140, 85],
                    [280, 55],
                    [420, 60],
                    [600, 40],
                  ].map(([cx, cy], idx) => (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      className="fill-white dark:fill-[#0D1117] stroke-[#E11D48]"
                      strokeWidth="2.5"
                    />
                  ))}
                </svg>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-zinc-400 font-mono">
                  <span>Repositories: {ghProfile.public_repos} Public</span>
                  <a
                    href={ghProfile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E11D48] dark:text-[#F59E0B] hover:underline font-semibold"
                  >
                    View Full Activity on GitHub →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Certificate */}
      {lightboxCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setLightboxCert(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl bg-white dark:bg-[#12141D] border border-slate-200 dark:border-white/15 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h3
                id="cert-modal-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {lightboxCert.title}
              </h3>
              <button
                type="button"
                onClick={() => setLightboxCert(null)}
                aria-label="Close certificate viewer"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-slate-950 flex justify-center">
              <img
                src={lightboxCert.image}
                alt={lightboxCert.alt}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
