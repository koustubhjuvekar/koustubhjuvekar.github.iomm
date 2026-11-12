import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Lock,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import {
  type PortfolioContentData,
  DEFAULT_PORTFOLIO_CONTENT,
} from '../data/portfolioData';
import {
  uploadPortfolioImage,
  downloadPortfolioJsonFile,
} from '../utils/cmsStorage';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  verifyAdminLogin,
  issueFirebaseEmailOtp,
  verifyOtpAndChangeAdminPassword,
  ensureFirestoreAdminDoc,
  type User as FirebaseUser,
} from '../firebase';

interface AdminPortalModalProps {
  isOpen: boolean;
  initialTab?: string;
  isAdminLoggedIn: boolean;
  content: PortfolioContentData;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onSaveContent: (updated: PortfolioContentData) => Promise<{ savedToRepoFile: boolean }>;
  onOpenProjectEditor: (project: { id: string; name: string; meta: string }) => void;
  onClose: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  initialTab = 'profile',
  isAdminLoggedIn,
  content,
  onLoginSuccess,
  onLogout,
  onSaveContent,
  onOpenProjectEditor,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'profile');
  const [draft, setDraft] = useState<PortfolioContentData>(() =>
    JSON.parse(JSON.stringify(content))
  );

  // Login states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showForgotOtpOnLogin, setShowForgotOtpOnLogin] = useState(false);

  // Save status banner
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Firebase Auth & OTP Password Change states
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [otpTargetEmail, setOtpTargetEmail] = useState(
    content.profile.email || 'koustubhjuvekarofficial@gmail.com'
  );
  const [activeOtpId, setActiveOtpId] = useState('');
  const [generatedOtpPreview, setGeneratedOtpPreview] = useState<string | null>(null);
  const [otpInputCode, setOtpInputCode] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('admin');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (u?.email) {
        setOtpTargetEmail(u.email);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDraft(JSON.parse(JSON.stringify(content)));
      if (initialTab) setActiveTab(initialTab);
      setStatusBanner(null);
      setLoginError(null);
    }
  }, [isOpen, initialTab, content]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const valid = await verifyAdminLogin(usernameInput, passwordInput);
    if (valid) {
      onLoginSuccess();
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('Invalid credentials. Default username is "admin" and password is "Admin".');
    }
  };

  const handleSaveAll = async () => {
    const result = await onSaveContent(draft);
    setStatusBanner({
      type: 'success',
      text: result.savedToRepoFile
        ? 'All portfolio changes saved directly to /public/data/portfolio-content.json in repo folder!'
        : 'All portfolio changes saved! Click "Download JSON for Repo" to update your GitHub folder.',
    });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (parsed && parsed.profile && Array.isArray(parsed.projectCategories)) {
          setDraft(parsed);
          await onSaveContent(parsed);
          setStatusBanner({
            type: 'success',
            text: 'Imported portfolio-content.json and updated all sections!',
          });
        } else {
          setStatusBanner({
            type: 'error',
            text: 'Invalid portfolio-content.json structure.',
          });
        }
      } catch {
        setStatusBanner({
          type: 'error',
          text: 'Could not parse JSON file.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = async () => {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_CONTENT));
    setDraft(fresh);
    await onSaveContent(fresh);
    setStatusBanner({
      type: 'info',
      text: 'Reset portfolio content back to original repository defaults.',
    });
  };

  const handleFirebaseGoogleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await ensureFirestoreAdminDoc(cred.user);
        setStatusBanner({
          type: 'success',
          text: `Connected to Firebase as ${cred.user.email} (Verified).`,
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Firebase Google sign-in failed.',
      });
    }
  };

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setStatusBanner(null);
    try {
      const res = await issueFirebaseEmailOtp(otpTargetEmail);
      setActiveOtpId(res.otpId);
      setGeneratedOtpPreview(res.code);
      setStatusBanner({
        type: 'success',
        text: res.savedInFirebase
          ? `6-digit OTP recorded in Firebase Firestore (/admin_otps/${res.otpId}) and dispatched to ${otpTargetEmail}.`
          : `6-digit OTP generated for ${otpTargetEmail}. Enter the 6-digit code below to change your password.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to issue OTP.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await verifyOtpAndChangeAdminPassword({
      otpId: activeOtpId,
      otpInput: otpInputCode,
      newUsername: newAdminUsername,
      newPassword: newAdminPassword,
      email: otpTargetEmail,
    });
    if (res.ok) {
      setStatusBanner({ type: 'success', text: res.message });
      setOtpInputCode('');
      setNewAdminPassword('');
      setGeneratedOtpPreview(null);
      if (!isAdminLoggedIn) {
        onLoginSuccess();
        setShowForgotOtpOnLogin(false);
      }
    } else {
      setStatusBanner({ type: 'error', text: res.message });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0F17] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="admin-portal-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {isAdminLoggedIn
                  ? 'Portfolio Admin CMS & Local Repo Manager'
                  : 'Admin Login'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isAdminLoggedIn
                  ? 'All edits save directly to /public/data/portfolio-content.json for GitHub hosting'
                  : 'Log in as Admin to edit all portfolio sections, projects, photos, commands & FAQs'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdminLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Repo Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadPortfolioJsonFile(draft)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                  title="Download portfolio-content.json to place in public/data/ folder"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Modal"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-200 dark:bg-white/[0.08] text-slate-800 dark:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {statusBanner && (
          <div
            className={`px-6 py-3 text-xs font-semibold flex items-center justify-between gap-3 border-b ${
              statusBanner.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : statusBanner.type === 'error'
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30'
                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Body */}
        {!isAdminLoggedIn ? (
          /* LOGIN VIEW */
          <div className="p-6 sm:p-10 max-w-md mx-auto w-full space-y-6">
            {!showForgotOtpOnLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-[#E11D48]/15 text-[#E11D48] flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Sign In as Admin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Default Username: <code className="font-mono font-bold">admin</code> · Default Password:{' '}
                    <code className="font-mono font-bold">Admin</code>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
                  >
                    Admin Username
                  </label>
                  <input
                    id="admin-username"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
                  >
                    Admin Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Admin"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-xl transition-colors cursor-pointer"
                >
                  Login as Admin
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotOtpOnLogin(true)}
                    className="text-xs font-semibold text-[#E11D48] dark:text-[#F59E0B] hover:underline cursor-pointer"
                  >
                    Change / Reset Admin Password via Email OTP (Firebase) →
                  </button>
                </div>
              </form>
            ) : (
              /* FIREBASE OTP PASSWORD RESET ON LOGIN SCREEN */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Firebase Email OTP Password Reset
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotOtpOnLogin(false)}
                    className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Firebase Admin Identity:</span>
                    {fbUser ? (
                      <span className="font-mono text-emerald-500">{fbUser.email}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFirebaseGoogleSignIn}
                        className="px-2.5 py-1 rounded bg-[#E11D48] text-white font-semibold cursor-pointer"
                      >
                        Verify Google Email
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Admin Email for OTP</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={otpTargetEmail}
                        onChange={(e) => setOtpTargetEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                      />
                      <button
                        type="button"
                        disabled={isSendingOtp}
                        onClick={handleSendOtp}
                        className="px-3 py-1.5 rounded bg-[#E11D48] text-white font-semibold cursor-pointer shrink-0"
                      >
                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {generatedOtpPreview && (
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs">
                      Firebase OTP Challenge Active — Verification Code:{' '}
                      <strong className="text-sm">{generatedOtpPreview}</strong>
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerifyOtpAndChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">6-Digit Email OTP Code</label>
                    <input
                      type="text"
                      value={otpInputCode}
                      onChange={(e) => setOtpInputCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">New Admin Username</label>
                    <input
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">New Admin Password</label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                  >
                    Verify OTP &amp; Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED-IN CMS DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* CMS Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 px-6 py-3 bg-slate-100 dark:bg-[#141722] border-b border-slate-200 dark:border-white/10 shrink-0">
              {[
                { id: 'profile', label: '1. Hero, Portrait & Contact' },
                { id: 'about', label: '2. About & Case Studies' },
                { id: 'projects', label: '3. Projects & Practical Labs' },
                { id: 'certificates', label: '4. Certificates Banner' },
                { id: 'services', label: '5. Services' },
                { id: 'security', label: '6. Admin Password & OTP (Firebase)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-[#E11D48] text-white'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scrollable Tab Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-zinc-300">
              {/* TAB 1: PROFILE, HERO, PORTRAIT & CONTACT */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Hero Section &amp; Portrait Photo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Full Name</label>
                        <input
                          type="text"
                          value={draft.profile.name}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, name: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Portrait Role Badge</label>
                        <input
                          type="text"
                          value={draft.profile.portraitRoleBadge}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, portraitRoleBadge: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Hero Top Tagline</label>
                        <input
                          type="text"
                          value={draft.profile.heroTagline}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, heroTagline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Typed Headline 1</label>
                        <input
                          type="text"
                          value={draft.profile.typedHeadline}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, typedHeadline: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Typed Headline 2</label>
                        <input
                          type="text"
                          value={draft.profile.typedSecondary}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, typedSecondary: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Portrait Photo Path or Upload</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={draft.profile.portraitImage}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                profile: { ...draft.profile, portraitImage: e.target.value },
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                          <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const p = await uploadPortfolioImage(file);
                                setDraft({
                                  ...draft,
                                  profile: { ...draft.profile, portraitImage: p },
                                });
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Hero Subtitle</label>
                      <input
                        type="text"
                        value={draft.profile.heroSubtitle}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            profile: { ...draft.profile, heroSubtitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Hero Highlight Box Text</label>
                      <textarea
                        rows={2}
                        value={draft.profile.heroHighlightText}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            profile: { ...draft.profile, heroHighlightText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Contact & Social Links */}
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Contact Details, Resume &amp; Social Profiles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-semibold mb-1">Email Address</label>
                        <input
                          type="email"
                          value={draft.profile.email}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, email: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Phone / WhatsApp</label>
                        <input
                          type="text"
                          value={draft.profile.phone}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: {
                                ...draft.profile,
                                phone: e.target.value,
                                phoneHref: `tel:${e.target.value.replace(/\s+/g, '')}`,
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Location</label>
                        <input
                          type="text"
                          value={draft.profile.location}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, location: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">GitHub Username</label>
                        <input
                          type="text"
                          value={draft.profile.githubUsername}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, githubUsername: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Resume PDF Path</label>
                        <input
                          type="text"
                          value={draft.profile.resumeUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, resumeUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">WhatsApp QR Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={draft.profile.whatsappQrImage}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                profile: { ...draft.profile, whatsappQrImage: e.target.value },
                              })
                            }
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                          />
                          <label className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-white/10 font-semibold cursor-pointer">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const p = await uploadPortfolioImage(file);
                                setDraft({
                                  ...draft,
                                  profile: { ...draft.profile, whatsappQrImage: p },
                                });
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Social Links</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              profile: {
                                ...draft.profile,
                                socials: [
                                  ...draft.profile.socials,
                                  { name: 'Platform', url: 'https://', icon: '/images/git.png' },
                                ],
                              },
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E11D48] text-white font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Social</span>
                        </button>
                      </div>
                      {draft.profile.socials.map((soc, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            value={soc.name}
                            onChange={(e) => {
                              const next = [...draft.profile.socials];
                              next[idx] = { ...soc, name: e.target.value };
                              setDraft({
                                ...draft,
                                profile: { ...draft.profile, socials: next },
                              });
                            }}
                            placeholder="Platform Name"
                            className="sm:col-span-3 px-3 py-1.5 rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                          />
                          <input
                            type="text"
                            value={soc.url}
                            onChange={(e) => {
                              const next = [...draft.profile.socials];
                              next[idx] = { ...soc, url: e.target.value };
                              setDraft({
                                ...draft,
                                profile: { ...draft.profile, socials: next },
                              });
                            }}
                            placeholder="URL"
                            className="sm:col-span-8 px-3 py-1.5 rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = draft.profile.socials.filter((_, i) => i !== idx);
                              setDraft({
                                ...draft,
                                profile: { ...draft.profile, socials: next },
                              });
                            }}
                            className="sm:col-span-1 p-1.5 text-rose-500 flex justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT & FEATURED CASE STUDIES */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      About Me Greeting &amp; Bio
                    </h3>
                    <div>
                      <label className="block font-semibold mb-1">Greeting Heading</label>
                      <input
                        type="text"
                        value={draft.profile.aboutGreeting}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            profile: { ...draft.profile, aboutGreeting: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">About Bio Paragraph</label>
                      <textarea
                        rows={4}
                        value={draft.profile.aboutBio}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            profile: { ...draft.profile, aboutBio: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Featured Case Studies */}
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Featured Implementations ({draft.featuredAboutProjects.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            featuredAboutProjects: [
                              ...draft.featuredAboutProjects,
                              {
                                id: `featured-${Date.now()}`,
                                title: 'NEW FEATURED PROJECT',
                                description: 'Project overview description...',
                                responsibilities: ['Key responsibility 1'],
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Implementation Card</span>
                      </button>
                    </div>

                    {draft.featuredAboutProjects.map((fp, idx) => (
                      <div
                        key={fp.id}
                        className="p-4 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={fp.title}
                            onChange={(e) => {
                              const next = [...draft.featuredAboutProjects];
                              next[idx] = { ...fp, title: e.target.value };
                              setDraft({ ...draft, featuredAboutProjects: next });
                            }}
                            className="flex-1 px-3 py-1.5 font-bold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = draft.featuredAboutProjects.filter((_, i) => i !== idx);
                              setDraft({ ...draft, featuredAboutProjects: next });
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/15 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={fp.description}
                          onChange={(e) => {
                            const next = [...draft.featuredAboutProjects];
                            next[idx] = { ...fp, description: e.target.value };
                            setDraft({ ...draft, featuredAboutProjects: next });
                          }}
                          className="w-full px-3 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />

                        <div>
                          <label className="block font-semibold mb-1">
                            Responsibilities (One per line)
                          </label>
                          <textarea
                            rows={4}
                            value={fp.responsibilities.join('\n')}
                            onChange={(e) => {
                              const next = [...draft.featuredAboutProjects];
                              next[idx] = {
                                ...fp,
                                responsibilities: e.target.value.split('\n'),
                              };
                              setDraft({ ...draft, featuredAboutProjects: next });
                            }}
                            className="w-full px-3 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15 font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECT CATEGORIES & INDIVIDUAL PROJECT LABS */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Technology Categories &amp; Projects ({draft.projectCategories.length} Categories)
                      </h3>
                      <p className="text-slate-500 dark:text-zinc-400">
                        Add/edit categories or click &ldquo;Edit Guide / Steps / Photos / Commands&rdquo; on any project to edit its full modal!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          projectCategories: [
                            ...draft.projectCategories,
                            {
                              id: `cat-${Date.now()}`,
                              title: 'New Technology',
                              subtitle: 'Cloud • DevOps • Automation',
                              description: 'Projects in this category.',
                              iconUrl: '/images/devops.png',
                              projects: [
                                {
                                  id: `proj-${Date.now()}`,
                                  name: '01. New Practical Project',
                                  meta: 'Cloud • Linux • Automation',
                                },
                              ],
                            },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Technology Category</span>
                    </button>
                  </div>

                  <div className="space-y-5">
                    {draft.projectCategories.map((cat, cIdx) => (
                      <div
                        key={cat.id}
                        className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => {
                              const next = [...draft.projectCategories];
                              next[cIdx] = { ...cat, title: e.target.value };
                              setDraft({ ...draft, projectCategories: next });
                            }}
                            placeholder="Category Title"
                            className="sm:col-span-4 px-3 py-1.5 font-bold rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                          />
                          <input
                            type="text"
                            value={cat.subtitle}
                            onChange={(e) => {
                              const next = [...draft.projectCategories];
                              next[cIdx] = { ...cat, subtitle: e.target.value };
                              setDraft({ ...draft, projectCategories: next });
                            }}
                            placeholder="Subtitle"
                            className="sm:col-span-4 px-3 py-1.5 rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                          />
                          <div className="sm:col-span-3 flex gap-1.5">
                            <input
                              type="text"
                              value={cat.iconUrl}
                              onChange={(e) => {
                                const next = [...draft.projectCategories];
                                next[cIdx] = { ...cat, iconUrl: e.target.value };
                                setDraft({ ...draft, projectCategories: next });
                              }}
                              placeholder="Icon URL"
                              className="flex-1 px-2.5 py-1.5 rounded bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                            />
                            <label className="px-2.5 py-1.5 rounded bg-slate-200 dark:bg-white/10 font-semibold cursor-pointer shrink-0">
                              Icon
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const p = await uploadPortfolioImage(file);
                                  const next = [...draft.projectCategories];
                                  next[cIdx] = { ...cat, iconUrl: p };
                                  setDraft({ ...draft, projectCategories: next });
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = draft.projectCategories.filter((_, i) => i !== cIdx);
                              setDraft({ ...draft, projectCategories: next });
                            }}
                            className="sm:col-span-1 p-1.5 text-rose-500 flex justify-center cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Standard Projects List inside Category */}
                        {cat.projects && (
                          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                Projects in {cat.title} ({cat.projects.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...draft.projectCategories];
                                  const projs = [...(cat.projects || [])];
                                  projs.push({
                                    id: `${cat.id}-${Date.now()}`,
                                    name: `${String(projs.length + 1).padStart(2, '0')}. New ${cat.title} Project`,
                                    meta: cat.subtitle,
                                  });
                                  next[cIdx] = { ...cat, projects: projs };
                                  setDraft({ ...draft, projectCategories: next });
                                }}
                                className="text-xs font-semibold text-[#E11D48] dark:text-[#F59E0B] hover:underline cursor-pointer"
                              >
                                + Add Project to {cat.title}
                              </button>
                            </div>

                            {cat.projects.map((proj, pIdx) => (
                              <div
                                key={proj.id}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10"
                              >
                                <input
                                  type="text"
                                  value={proj.name}
                                  onChange={(e) => {
                                    const next = [...draft.projectCategories];
                                    const projs = [...(cat.projects || [])];
                                    projs[pIdx] = { ...proj, name: e.target.value };
                                    next[cIdx] = { ...cat, projects: projs };
                                    setDraft({ ...draft, projectCategories: next });
                                  }}
                                  className="sm:col-span-4 px-2.5 py-1.5 font-semibold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                                />
                                <input
                                  type="text"
                                  value={proj.meta}
                                  onChange={(e) => {
                                    const next = [...draft.projectCategories];
                                    const projs = [...(cat.projects || [])];
                                    projs[pIdx] = { ...proj, meta: e.target.value };
                                    next[cIdx] = { ...cat, projects: projs };
                                    setDraft({ ...draft, projectCategories: next });
                                  }}
                                  className="sm:col-span-4 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                                />
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onSaveContent(draft);
                                    onOpenProjectEditor({
                                      id: proj.id,
                                      name: proj.name,
                                      meta: proj.meta,
                                    });
                                  }}
                                  className="sm:col-span-3 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] hover:bg-[#E11D48] hover:text-white font-semibold transition-colors cursor-pointer"
                                >
                                  <span>Edit Steps / Photos / FAQs</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...draft.projectCategories];
                                    const projs = (cat.projects || []).filter((_, i) => i !== pIdx);
                                    next[cIdx] = { ...cat, projects: projs };
                                    setDraft({ ...draft, projectCategories: next });
                                  }}
                                  className="sm:col-span-1 p-1.5 text-rose-500 flex justify-center cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* SubGroups (e.g. Docker / Kubernetes inside DevOps) */}
                        {cat.subGroups && (
                          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                            {cat.subGroups.map((sg, sgIdx) => (
                              <div
                                key={sgIdx}
                                className="p-3 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-2"
                              >
                                <label className="block font-bold">{sg.name} Projects (One per line)</label>
                                <textarea
                                  rows={4}
                                  value={sg.items.join('\n')}
                                  onChange={(e) => {
                                    const next = [...draft.projectCategories];
                                    const groups = [...(cat.subGroups || [])];
                                    groups[sgIdx] = {
                                      ...sg,
                                      items: e.target.value.split('\n').filter((x) => x.trim().length > 0),
                                    };
                                    next[cIdx] = { ...cat, subGroups: groups };
                                    setDraft({ ...draft, projectCategories: next });
                                  }}
                                  className="w-full px-3 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15 font-mono"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CERTIFICATES BANNER */}
              {activeTab === 'certificates' && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Certificates Banner Carousel ({draft.certificatesBanner.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          certificatesBanner: [
                            ...draft.certificatesBanner,
                            {
                              id: `cert-${Date.now()}`,
                              title: 'New Certification',
                              alt: 'Certificate',
                              image: '/images/googlecyber.jpg',
                            },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Certificate Slide</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draft.certificatesBanner.map((cert, idx) => (
                      <div
                        key={cert.id}
                        className="p-4 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) => {
                            const next = [...draft.certificatesBanner];
                            next[idx] = { ...cert, title: e.target.value, alt: e.target.value };
                            setDraft({ ...draft, certificatesBanner: next });
                          }}
                          placeholder="Certificate Title"
                          className="sm:col-span-5 px-3 py-2 font-semibold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />
                        <div className="sm:col-span-6 flex gap-2">
                          <input
                            type="text"
                            value={cert.image}
                            onChange={(e) => {
                              const next = [...draft.certificatesBanner];
                              next[idx] = { ...cert, image: e.target.value };
                              setDraft({ ...draft, certificatesBanner: next });
                            }}
                            placeholder="Image URL"
                            className="flex-1 px-3 py-2 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                          />
                          <label className="inline-flex items-center gap-1 px-3 py-2 rounded bg-[#E11D48] text-white font-semibold cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const p = await uploadPortfolioImage(file);
                                const next = [...draft.certificatesBanner];
                                next[idx] = { ...cert, image: p };
                                setDraft({ ...draft, certificatesBanner: next });
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = draft.certificatesBanner.filter((_, i) => i !== idx);
                            setDraft({ ...draft, certificatesBanner: next });
                          }}
                          className="sm:col-span-1 p-2 text-rose-500 flex justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SERVICES */}
              {activeTab === 'services' && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Services Section (&ldquo;What I can do for you?&rdquo;)
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          services: [
                            ...draft.services,
                            {
                              id: `srv-${Date.now()}`,
                              title: 'New Service',
                              icon: '/images/aws-icon.png',
                              description: 'Service description...',
                            },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Service Card</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Services Section Subtitle</label>
                    <input
                      type="text"
                      value={draft.profile.servicesSubtitle}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          profile: { ...draft.profile,장으로: undefined, servicesSubtitle: e.target.value } as any,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {draft.services.map((srv, idx) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={srv.title}
                            onChange={(e) => {
                              const next = [...draft.services];
                              next[idx] = { ...srv, title: e.target.value };
                              setDraft({ ...draft, services: next });
                            }}
                            className="flex-1 px-2.5 py-1.5 font-bold rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = draft.services.filter((_, i) => i !== idx);
                              setDraft({ ...draft, services: next });
                            }}
                            className="p-1 text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={srv.icon}
                            onChange={(e) => {
                              const next = [...draft.services];
                              next[idx] = { ...srv, icon: e.target.value };
                              setDraft({ ...draft, services: next });
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                          />
                          <label className="px-2.5 py-1.5 rounded bg-slate-200 dark:bg-white/10 font-semibold cursor-pointer">
                            Icon
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const p = await uploadPortfolioImage(file);
                                const next = [...draft.services];
                                next[idx] = { ...srv, icon: p };
                                setDraft({ ...draft, services: next });
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <textarea
                          rows={3}
                          value={srv.description}
                          onChange={(e) => {
                            const next = [...draft.services];
                            next[idx] = { ...srv, description: e.target.value };
                            setDraft({ ...draft, services: next });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-50 dark:bg-[#151824] border border-slate-300 dark:border-white/15"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: FIREBASE ADMIN PASSWORD & EMAIL OTP VERIFICATION */}
              {activeTab === 'security' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#E11D48] dark:text-[#F59E0B]" />
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        Step 1: Firebase Identity &amp; Email OTP
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Only Admin password management and OTP email verification use Firebase (free Spark tier). All portfolio content is stored locally in your repository folder (<code className="font-mono">/public/data/portfolio-content.json</code>).
                    </p>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0C10] border border-slate-200 dark:border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Firebase Google Auth Status:</span>
                        {fbUser ? (
                          <span className="font-mono text-emerald-500 font-semibold">
                            {fbUser.email} (Verified)
                          </span>
                        ) : (
                          <span className="font-mono text-amber-500">Not Linked</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleFirebaseGoogleSignIn}
                          className="px-3.5 py-2 rounded-lg bg-[#E11D48] text-white font-semibold cursor-pointer"
                        >
                          {fbUser ? 'Re-Verify Google Account' : 'Connect Google Account (Firebase)'}
                        </button>
                        {fbUser && (
                          <button
                            type="button"
                            onClick={() => signOut(auth)}
                            className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/10 font-semibold cursor-pointer"
                          >
                            Unlink Firebase Auth
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-semibold">
                        Admin Email for OTP Verification
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={otpTargetEmail}
                          onChange={(e) => setOtpTargetEmail(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                        />
                        <button
                          type="button"
                          disabled={isSendingOtp}
                          onClick={handleSendOtp}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold cursor-pointer shrink-0"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isSendingOtp ? 'Sending...' : 'Send 6-Digit OTP'}</span>
                        </button>
                      </div>
                    </div>

                    {generatedOtpPreview && (
                      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono">
                        Firebase OTP Challenge Dispatched! Verification Code:{' '}
                        <strong className="text-sm">{generatedOtpPreview}</strong>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Verify OTP & Update Password */}
                  <form
                    onSubmit={handleVerifyOtpAndChangePassword}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-[#151824] border border-slate-200 dark:border-white/10 space-y-4"
                  >
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      Step 2: Verify OTP &amp; Change Admin Password
                    </h3>

                    <div>
                      <label className="block font-semibold mb-1">6-Digit OTP Code</label>
                      <input
                        type="text"
                        value={otpInputCode}
                        onChange={(e) => setOtpInputCode(e.target.value)}
                        placeholder="Enter 6-digit OTP code"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Admin Username</label>
                      <input
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">New Admin Password</label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                    >
                      Verify OTP &amp; Save New Password in Firebase
                    </button>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                      <span className="text-slate-500">Restore original portfolio data?</span>
                      <button
                        type="button"
                        onClick={handleResetDefault}
                        className="inline-flex items-center gap-1 text-rose-500 hover:underline font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Portfolio Content</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
