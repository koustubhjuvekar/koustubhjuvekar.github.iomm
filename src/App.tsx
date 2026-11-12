import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CertificationsAndGithubSection } from './components/CertificationsAndGithubSection';
import { ContactAndResumeSection } from './components/ContactAndResumeModals';
import { ProjectModal } from './components/ProjectModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import {
  DEFAULT_PORTFOLIO_CONTENT,
  type PortfolioContentData,
  type ProjectDetailData,
} from './data/portfolioData';
import {
  loadPortfolioContent,
  savePortfolioContent,
} from './utils/cmsStorage';

const ADMIN_SESSION_KEY = 'kj_admin_logged_in_v1';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('kj_theme_mode');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [portfolioContent, setPortfolioContent] = useState<PortfolioContentData>(
    DEFAULT_PORTFOLIO_CONTENT
  );
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('profile');

  const [activeProject, setActiveProject] = useState<{
    id: string;
    name: string;
    meta: string;
  } | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);

  // Load saved portfolio content from /data/portfolio-content.json or localStorage
  useEffect(() => {
    let mounted = true;
    loadPortfolioContent().then((loaded) => {
      if (mounted && loaded) {
        setPortfolioContent(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('kj_theme_mode', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenAdminSection = (tab = 'profile') => {
    setAdminInitialTab(tab);
    setAdminModalOpen(true);
  };

  const handleSaveFullContent = async (
    updated: PortfolioContentData
  ): Promise<{ savedToRepoFile: boolean }> => {
    setPortfolioContent(updated);
    return await savePortfolioContent(updated);
  };

  const handleSaveProjectDetail = async (
    projectId: string,
    updatedDetail: ProjectDetailData
  ) => {
    const nextContent: PortfolioContentData = {
      ...portfolioContent,
      projectDetails: {
        ...portfolioContent.projectDetails,
        [projectId]: updatedDetail,
      },
    };
    setPortfolioContent(nextContent);
    await savePortfolioContent(nextContent);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0C10] text-slate-900 dark:text-[#F4F4F6] flex flex-col transition-colors">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        profile={portfolioContent.profile}
      />

      <main className="flex-1">
        <HeroSection
          profile={portfolioContent.profile}
          featuredAboutProjects={portfolioContent.featuredAboutProjects}
          onOpenResume={() => setResumeOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminSection={handleOpenAdminSection}
        />

        <ProjectsSection
          categories={portfolioContent.projectCategories}
          onOpenProjectDetail={(proj) => setActiveProject(proj)}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminSection={handleOpenAdminSection}
        />

        <CertificationsAndGithubSection
          certificates={portfolioContent.certificatesBanner}
          services={portfolioContent.services}
          profile={portfolioContent.profile}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminSection={handleOpenAdminSection}
        />

        <ContactAndResumeSection
          profile={portfolioContent.profile}
          resumeModalOpen={resumeOpen}
          onCloseResume={() => setResumeOpen(false)}
          onOpenResume={() => setResumeOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminPortal={handleOpenAdminSection}
        />
      </main>

      <ProjectModal
        activeProject={activeProject}
        content={portfolioContent}
        isAdminLoggedIn={isAdminLoggedIn}
        onSaveProjectDetail={handleSaveProjectDetail}
        onRequestAdminLogin={() => {
          setActiveProject(null);
          handleOpenAdminSection('projects');
        }}
        onClose={() => setActiveProject(null)}
      />

      <AdminPortalModal
        isOpen={adminModalOpen}
        initialTab={adminInitialTab}
        isAdminLoggedIn={isAdminLoggedIn}
        content={portfolioContent}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          try {
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          } catch {
            // ignore
          }
        }}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          try {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
          } catch {
            // ignore
          }
        }}
        onSaveContent={handleSaveFullContent}
        onOpenProjectEditor={(proj) => {
          setAdminModalOpen(false);
          setActiveProject(proj);
        }}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}
