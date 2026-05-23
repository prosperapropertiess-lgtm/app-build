"use client";

import { useEffect, useState } from "react";

export default function InstallPromptPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📱</span>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Install Project X</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Add to your home screen for the best experience
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-xl transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-green-500 hover:bg-green-400 text-zinc-950 text-sm font-semibold rounded-xl transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}