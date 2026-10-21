import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCode,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRepo?: string;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  defaultRepo = 'officialnaziransari/StudyVerse10',
}) => {
  const [repoName, setRepoName] = useState(defaultRepo);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'pwa' | 'instructions'>('apk');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setPwaInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  // GitHub Release Download URLs
  const sanitizedRepo = repoName.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const latestReleaseUrl = `https://github.com/${sanitizedRepo}/releases/latest`;
  const directApkUrl = `https://github.com/${sanitizedRepo}/releases/latest/download/StudyVerse10-debug.apk`;
  const actionsWorkflowUrl = `https://github.com/${sanitizedRepo}/actions/workflows/build-apk.yml`;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install directly on your phone:\n\n1. Open your browser menu (⋮ or Share icon)\n2. Tap "Install App" or "Add to Home Screen"\n3. StudyVerse 10 will launch as a full-screen app!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Download Android App</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  APK / PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Play StudyVerse 10 in full-screen on your Android phone or tablet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 text-xs px-6 pt-2">
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'apk'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>GitHub APK Download</span>
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'pwa'
                ? 'border-emerald-500 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Tap Web App Install</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'instructions'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Install on Phone</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === 'apk' && (
            <div className="space-y-4">
              {/* Direct Download Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-cyan-950/30 border border-cyan-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">Direct GitHub APK Link</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Latest Release
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Download the latest pre-compiled debug APK asset published by GitHub Actions directly to your device.
                </p>

                {/* Direct Link URL Box */}
                <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={directApkUrl}
                    className="flex-1 bg-transparent text-[11px] font-mono text-cyan-300 outline-none select-all overflow-ellipsis"
                  />
                  <button
                    onClick={() => handleCopyLink(directApkUrl)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1"
                    title="Copy direct download link"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={directApkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 font-bold text-white text-center shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK ({sanitizedRepo})</span>
                  </a>

                  <a
                    href={latestReleaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 flex items-center space-x-1.5 transition"
                  >
                    <span>View GitHub Release</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* GitHub Repository Target Customizer */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">Target GitHub Repository:</span>
                  <span className="text-[10px] text-slate-500">owner/repository-name</span>
                </div>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="e.g. officialnaziransari/StudyVerse10"
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">
                  Change this if your repository is named differently on GitHub to automatically update your download link.
                </p>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Platform</span>
                  <span className="text-white font-semibold">Android 8.0+ (ARM64 / x86)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Curriculum</span>
                  <span className="text-emerald-400 font-semibold">CBSE Class 10 Science 2026–27</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant 1-Tap Home Screen App (No APK Sideloading Required)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  StudyVerse 10 is Progressive Web App (PWA) certified. You can install it immediately onto your Android phone's home screen with one tap. It opens in dedicated full-screen mode and works offline with fast WebGL 3D graphics.
                </p>

                <button
                  onClick={handleInstallPwa}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{pwaInstalled ? 'App Installed on Device' : 'Install to Home Screen Now'}</span>
                </button>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">Why choose 1-Tap Install?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Instant launch from your Android app drawer and home screen.</li>
                  <li>No warning dialogs or manual unknown source permissions needed.</li>
                  <li>Automatic live updates whenever new NCERT chapter labs are published.</li>
                  <li>Touch joystick, audio synth, and SciBuddy AI companion fully supported.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">How to Sideload the APK on Android:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Download the APK</h4>
                    <p className="text-[11px] text-slate-400">
                      Tap the "Download APK" button. The file will save to your phone's Downloads folder.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Open the Downloaded File</h4>
                    <p className="text-[11px] text-slate-400">
                      Tap the notification or open your device File Manager &gt; Downloads &gt; <code className="text-cyan-300">StudyVerse10-debug.apk</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Allow Unknown Apps</h4>
                    <p className="text-[11px] text-slate-400">
                      If prompted by Android Security, tap Settings and enable "Allow from this source" for Chrome / your browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Tap Install & Launch</h4>
                    <p className="text-[11px] text-slate-400">
                      Confirm installation. Once finished, open StudyVerse 10 and start your 3D Chemistry Mission!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Virtual-Only Lab &middot; Safe Chemistry</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
