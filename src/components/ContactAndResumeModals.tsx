import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  QrCode,
  Send,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  X,
  Shield,
  Edit3,
} from 'lucide-react';
import { type ProfileData } from '../data/portfolioData';
import { validateContactForm, type ContactValidationResult } from '../utils/portfolioLogic';

interface ContactAndResumeProps {
  profile: ProfileData;
  resumeModalOpen: boolean;
  onCloseResume: () => void;
  onOpenResume: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPortal: (tab?: string) => void;
}

interface SubmittedMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export const ContactAndResumeSection: React.FC<ContactAndResumeProps> = ({
  profile,
  resumeModalOpen,
  onCloseResume,
  onOpenResume,
  isAdminLoggedIn,
  onOpenAdminPortal,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ContactValidationResult['errors']>({});
  const [submittedList, setSubmittedList] = useState<SubmittedMessage[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (qrModalOpen) setQrModalOpen(false);
        if (resumeModalOpen) onCloseResume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [qrModalOpen, resumeModalOpen, onCloseResume]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateContactForm({ name, email, subject, message });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    const newEntry: SubmittedMessage = {
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSubmittedList((prev) => [newEntry, ...prev]);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <>
      <section
        id="contact"
        className="py-16 bg-slate-50 dark:bg-[#0B0C10] transition-colors"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          {isAdminLoggedIn && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => onOpenAdminPortal('profile')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E11D48]/15 text-[#E11D48] dark:text-[#F59E0B] border border-[#E11D48]/30 hover:bg-[#E11D48] hover:text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Contact &amp; Socials</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 5 Cols: Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-mono font-semibold text-[#E11D48] dark:text-[#F59E0B] mb-2">
                  Get In Touch
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  CONTACT
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
                  Connect directly via email, phone, or WhatsApp for Cloud &amp; DevOps opportunities.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="p-4 rounded-xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 flex items-start gap-3.5 shadow-xs">
                  <Mail className="w-5 h-5 text-[#E11D48] dark:text-[#F59E0B] mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <div className="text-slate-500 dark:text-zinc-400">Email</div>
                    <a
                      href={`mailto:${profile.email}`}
                      className="block font-mono text-sm font-semibold text-slate-900 dark:text-white hover:text-[#E11D48] dark:hover:text-[#F59E0B] transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6] mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <div className="text-slate-500 dark:text-zinc-400">Mobile / WhatsApp</div>
                      <a
                        href={profile.phoneHref}
                        className="block font-mono text-sm font-bold text-slate-900 dark:text-white hover:text-[#E11D48] transition-colors tabular-nums"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-300 dark:border-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#F59E0B]" />
                    <span>WhatsApp QR</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 flex items-start gap-3.5 shadow-xs">
                  <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div className="text-xs space-y-1">
                    <div className="text-slate-500 dark:text-zinc-400">Location</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {profile.location}
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {profile.socials.map((soc) => (
                  <a
                    key={soc.name}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-[#E11D48] dark:hover:border-[#F59E0B] transition-colors"
                  >
                    {soc.name}
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>See My Resume</span>
                </button>
                <a
                  href={profile.resumeUrl}
                  download="Koustubh_Juvekar_Resume.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-white dark:bg-[#131621] border border-slate-300 dark:border-white/15 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>

            {/* Right 7 Cols: Contact Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/10 shadow-xs space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Send a Message
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Fill out the form below to send a direct message.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Cloud / DevOps Opportunity"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.subject}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-[#0B0C10] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>

              {submittedList.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Message received ({submittedList.length})</span>
                  </div>
                  {submittedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0C10] border border-emerald-500/30 text-xs space-y-1"
                    >
                      <div className="font-mono text-slate-500 dark:text-zinc-400">
                        {item.name} ({item.email}) · {item.submittedAt}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.subject}
                      </div>
                      <p className="text-slate-600 dark:text-zinc-300">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer matching index.html copyright + Admin Button in Corner Below */}
      <footer className="py-8 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#08090D] text-xs text-slate-600 dark:text-zinc-400 transition-colors">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Copyright © 2025 Designed &amp; built by{' '}
            <strong className="text-slate-900 dark:text-white">{profile.name}</strong>. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#about" className="hover:text-[#E11D48] transition-colors">
              About
            </a>
            <a href="#projects" className="hover:text-[#E11D48] transition-colors">
              My Projects
            </a>
            <a href="#certificates" className="hover:text-[#E11D48] transition-colors">
              Certificates
            </a>
            <a href="#services" className="hover:text-[#E11D48] transition-colors">
              Services
            </a>
            <a href="#contact" className="hover:text-[#E11D48] transition-colors">
              Contact
            </a>
            <button
              type="button"
              onClick={() => onOpenAdminPortal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141722] border border-slate-300 dark:border-white/15 font-semibold text-slate-800 dark:text-zinc-200 hover:border-[#E11D48] dark:hover:border-[#F59E0B] transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#F59E0B]" />
              <span>{isAdminLoggedIn ? 'Admin CMS (Active)' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Bottom-Right Corner Admin Button */}
      <button
        type="button"
        onClick={() => onOpenAdminPortal()}
        aria-label="Open Admin Portal"
        className={`fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer ${
          isAdminLoggedIn
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400/30'
            : 'bg-white/95 dark:bg-[#141722]/95 hover:border-[#E11D48] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-white/15 backdrop-blur-md'
        }`}
      >
        <Shield className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#F59E0B]" />
        <span>{isAdminLoggedIn ? 'Admin CMS' : 'Admin'}</span>
      </button>

      {/* WhatsApp QR Modal */}
      {qrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-qr-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="relative max-w-sm w-full rounded-2xl bg-white dark:bg-[#131621] border border-slate-200 dark:border-white/15 p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3
                id="whatsapp-qr-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                WhatsApp QR Code
              </h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                aria-label="Close WhatsApp QR modal"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 mx-auto w-fit">
              <img
                src={profile.whatsappQrImage}
                alt="WhatsApp QR"
                className="w-56 h-56 object-contain"
              />
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-zinc-300">
              {profile.phone}
            </p>
          </div>
        </div>
      )}

      {/* Resume PDF Modal */}
      {resumeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          onClick={onCloseResume}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-[#11131C] border border-slate-200 dark:border-white/15 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-white/10">
              <h2
                id="resume-modal-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {profile.name} — Resume
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href={profile.resumeUrl}
                  download="Koustubh_Juvekar_Resume.pdf"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  type="button"
                  onClick={onCloseResume}
                  aria-label="Close resume viewer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-800 dark:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-[75vh] bg-slate-900">
              <iframe
                src={profile.resumeUrl}
                title="Koustubh Juvekar Resume PDF"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
