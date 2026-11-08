import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, do not display
  if (isInstalled) {
    if (variant === 'full') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>App is currently installed and running in standalone mode.</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'full') {
      return (
        <button
          onClick={install}
          className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Install Application to Device
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
        title="Install Mess Manager app to your device"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'full' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            Install on iPhone / iPad
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Install on iOS Safari"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Add to Home Screen</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Install Mess Manager</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p>To run this application as a standalone app on your iPhone or iPad:</p>
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      1
                    </span>
                    <span className="flex items-center gap-1.5">
                      Tap the <Share2 className="w-4 h-4 text-indigo-600 shrink-0" /> <strong>Share</strong> button in Safari's bottom toolbar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      2
                    </span>
                    <span className="flex items-center gap-1.5">
                      Scroll down and tap <PlusSquare className="w-4 h-4 text-indigo-600 shrink-0" /> <strong>Add to Home Screen</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      3
                    </span>
                    <span>
                      Tap <strong>Add</strong> in the top right to install the icon.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info in Settings if not on installable prompt
  if (variant === 'full') {
    return (
      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
        To install this app, open it in Chrome, Edge, or Safari and select <strong>Install App</strong> or <strong>Add to Home Screen</strong> from the browser menu.
      </div>
    );
  }

  return null;
};
