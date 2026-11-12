import type {
  CommandQuickRef,
  ProjectCategoryCard,
  SubProjectItem,
} from '../data/portfolioData';

export interface RecentProjectVisit {
  id: string;
  name: string;
  categoryTitle: string;
  hasLab?: 'webserver' | '3tier';
  expiresAt: number;
}

export interface ActiveRecentProject extends RecentProjectVisit {
  remainingSeconds: number;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
}

export function getVisibleCategories(
  categories: ProjectCategoryCard[],
  showAll: boolean,
  initialLimit = 4
): ProjectCategoryCard[] {
  if (showAll) return categories;
  return categories.slice(0, initialLimit);
}

export function getVisibleSubProjects(
  projects: SubProjectItem[],
  showAll: boolean,
  initialLimit = 4
): SubProjectItem[] {
  if (showAll) return projects;
  return projects.slice(0, initialLimit);
}

export function nextCertificateIndex(
  currentIndex: number,
  total: number,
  direction: 'next' | 'prev'
): number {
  if (total <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

export function recordProjectVisit(
  history: RecentProjectVisit[],
  item: { id: string; name: string; categoryTitle: string; hasLab?: 'webserver' | '3tier' },
  nowMs: number,
  maxItems = 5,
  activeDurationMs = 15_000
): RecentProjectVisit[] {
  const validExisting = history.filter(
    (entry) => entry && entry.id !== item.id && entry.expiresAt > nowMs
  );

  const updated: RecentProjectVisit[] = [
    {
      id: item.id,
      name: item.name,
      categoryTitle: item.categoryTitle,
      hasLab: item.hasLab,
      expiresAt: nowMs + activeDurationMs,
    },
    ...validExisting,
  ];

  return updated.slice(0, maxItems);
}

export function getActiveRecentProjects(
  history: RecentProjectVisit[],
  nowMs: number
): ActiveRecentProject[] {
  return history
    .filter((item) => item && typeof item.expiresAt === 'number' && item.expiresAt > nowMs)
    .map((item) => ({
      ...item,
      remainingSeconds: Math.max(1, Math.ceil((item.expiresAt - nowMs) / 1000)),
    }));
}

export function validateContactForm(input: ContactFormInput): ContactValidationResult {
  const errors: ContactValidationResult['errors'] = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedSubject = input.subject.trim();
  const trimmedMessage = input.message.trim();

  if (!trimmedName || trimmedName.length < 2) {
    errors.name = 'Please enter your full name.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!trimmedSubject || trimmedSubject.length < 3) {
    errors.subject = 'Please enter a subject.';
  }

  if (!trimmedMessage || trimmedMessage.length < 10) {
    errors.message = 'Please enter a message of at least 10 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterLabCommands(
  commands: CommandQuickRef[],
  query: string
): CommandQuickRef[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter(
    (c) =>
      c.command.toLowerCase().includes(q) ||
      c.purpose.toLowerCase().includes(q) ||
      c.num.includes(q)
  );
}
