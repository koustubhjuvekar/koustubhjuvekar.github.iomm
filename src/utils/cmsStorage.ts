import {
  DEFAULT_PORTFOLIO_CONTENT,
  type PortfolioContentData,
} from '../data/portfolioData';

export const CMS_LOCAL_STORAGE_KEY = 'kj_portfolio_cms_v1';

export async function loadPortfolioContent(): Promise<PortfolioContentData> {
  // 1. Check localStorage first for immediate edits
  try {
    const cached = localStorage.getItem(CMS_LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.profile && Array.isArray(parsed.projectCategories)) {
        return {
          ...DEFAULT_PORTFOLIO_CONTENT,
          ...parsed,
          profile: {
            ...DEFAULT_PORTFOLIO_CONTENT.profile,
            ...(parsed.profile || {}),
          },
          projectDetails: {
            ...DEFAULT_PORTFOLIO_CONTENT.projectDetails,
            ...(parsed.projectDetails || {}),
          },
        };
      }
    }
  } catch {
    // ignore storage errors
  }

  // 2. Load from local repository file /data/portfolio-content.json
  try {
    const res = await fetch(`/data/portfolio-content.json?t=${Date.now()}`);
    if (res.ok) {
      const fileData = await res.json();
      if (fileData && fileData.profile && Array.isArray(fileData.projectCategories)) {
        return {
          ...DEFAULT_PORTFOLIO_CONTENT,
          ...fileData,
          profile: {
            ...DEFAULT_PORTFOLIO_CONTENT.profile,
            ...(fileData.profile || {}),
          },
          projectDetails: {
            ...DEFAULT_PORTFOLIO_CONTENT.projectDetails,
            ...(fileData.projectDetails || {}),
          },
        };
      }
    }
  } catch {
    // ignore fetch errors
  }

  return DEFAULT_PORTFOLIO_CONTENT;
}

export async function savePortfolioContent(
  content: PortfolioContentData
): Promise<{ savedToRepoFile: boolean }> {
  try {
    localStorage.setItem(CMS_LOCAL_STORAGE_KEY, JSON.stringify(content));
  } catch {
    // ignore quota errors
  }

  let savedToRepoFile = false;
  try {
    const res = await fetch('/api/local-cms/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (res.ok) {
      const data = await res.json();
      savedToRepoFile = !!data.ok;
    }
  } catch {
    // static host fallback
  }

  return { savedToRepoFile };
}

export async function uploadPortfolioImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch('/api/local-cms/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        dataUrl,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && typeof json.path === 'string') {
        return json.path;
      }
    }
  } catch {
    // fallback to dataUrl when running on static GitHub Pages
  }

  return dataUrl;
}

export async function downloadPortfolioJsonFile(
  content: PortfolioContentData
): Promise<void> {
  const jsonString = JSON.stringify(content, null, 2);

  // Use File System Access API if available so user can save directly into their repo folder
  const win = window as unknown as {
    showSaveFilePicker?: (opts: unknown) => Promise<{
      createWritable: () => Promise<{
        write: (data: string) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: 'portfolio-content.json',
        types: [
          {
            description: 'Portfolio JSON Data File',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
      return;
    } catch {
      // fallback to standard download if user cancels picker
    }
  }

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio-content.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
