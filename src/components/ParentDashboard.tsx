'use client';

import React, { useState } from 'react';
import { ChildProfile } from '@/types';
import {
  PRACTICED_FLASHCARDS,
  PRINTABLE_WORKBOOKS,
  VALID_UNLOCK_CODES,
} from '@/lib/playgroundData';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

interface ParentDashboardProps {
  profile: ChildProfile;
  onUpdateProfile: (updated: ChildProfile) => void;
  onClose: () => void;
  onUnlockAllEpisodes: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onUnlockAllEpisodes,
}) => {
  // PIN lock protection state (supports Stitch Demo PIN '2468' and '1234')
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'stats' | 'flashcards' | 'store' | 'settings'>('stats');

  // Lead capture state
  const [parentEmail, setParentEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [generatedUnlockCode, setGeneratedUnlockCode] = useState('');

  // Code redemption state
  const [inputCode, setInputCode] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [codeError, setCodeError] = useState(false);

  // Workbook purchase simulation
  const [purchasedWorkbookIds, setPurchasedWorkbookIds] = useState<string[]>([]);

  // Handle PIN keypad input
  const handlePinDigit = (digit: string) => {
    sound.playTap();
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(false);

      if (nextPin.length === 4) {
        if (nextPin === '2468' || nextPin === '1234') {
          sound.playChime(1.2);
          setIsAuthenticated(true);
        } else {
          sound.playSoftWiggle();
          setPinError(true);
          setTimeout(() => setEnteredPin(''), 500);
        }
      }
    }
  };

  // Handle Parent Email submission (Lead Capture for Progress Report & Free Code)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail || !parentEmail.includes('@')) return;

    sound.playChime(1.15);
    setEmailSubmitted(true);
    setGeneratedUnlockCode('KIDSFREE');
  };

  // Redeem unlock code
  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (VALID_UNLOCK_CODES.includes(clean)) {
      sound.playChime(1.25);
      setCodeSuccess(true);
      setCodeError(false);
      onUnlockAllEpisodes();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd23f', '#63ecdd', '#ff5964', '#b52234', '#edc22e'],
        });
      } catch {}
    } else {
      sound.playSoftWiggle();
      setCodeError(true);
    }
  };

  // Simulate buying a printable PDF workbook
  const handleBuyWorkbook = (wbId: string) => {
    sound.playChime(1.2);
    setPurchasedWorkbookIds((prev) => [...prev, wbId]);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffd23f', '#63ecdd', '#ff5964'],
      });
    } catch {}
  };

  // ==========================================
  // STITCH PIN GATE SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="w-full min-h-[calc(100vh-120px)] flex items-center justify-center p-5">
        <section
          id="pinGate"
          className="w-full max-w-[640px] bg-white rounded-[24px] border-2 border-[#F4EBD9] p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] flex flex-col items-center text-center gap-6"
        >
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-[0_4px_0_#edc22e]">
            <span className="material-symbols-outlined text-on-primary-container text-3xl">lock</span>
          </div>

          <div>
            <h1 className="font-headline text-[30px] font-bold text-on-surface">Parent Corner Gate</h1>
            <p className="text-on-surface-variant font-semibold mt-1">
              Enter the 4-digit grown-up PIN (Demo PIN: <strong>2468</strong>)
            </p>
          </div>

          {/* 4 PIN Slots */}
          <div className="flex gap-3" id="pinSlots">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`pin-slot w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center font-headline text-xl font-bold ${
                    pinError
                      ? 'border-[#ff5964] bg-[#ffdad9]/30'
                      : 'border-[#d1c5ad] bg-[#FDF8EE]'
                  }`}
                >
                  {hasDigit ? <span className="text-on-surface">●</span> : null}
                </div>
              );
            })}
          </div>

          {pinError && (
            <p className="text-[#b52234] font-bold text-sm -mt-2">
              Incorrect PIN. Tap <strong>Demo</strong> or enter <strong>2468</strong>.
            </p>
          )}

          {/* 3x4 Dialpad */}
          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="pin-btn w-16 h-16 rounded-full bg-white border-2 border-[#EFE7D6] shadow-[0_5px_0_#d9dadc] font-headline text-xl font-bold cursor-pointer hover:bg-surface-container-low active:translate-y-1 transition-all"
              >
                {digit}
              </button>
            ))}

            {/* Demo Instant Unlock Button */}
            <button
              id="demoUnlock"
              type="button"
              onClick={() => {
                sound.playChime(1.2);
                setIsAuthenticated(true);
              }}
              className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e] font-headline text-xs font-bold cursor-pointer hover:bg-primary-fixed active:translate-y-1 transition-all flex items-center justify-center"
            >
              Demo
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="pin-btn w-16 h-16 rounded-full bg-white border-2 border-[#EFE7D6] shadow-[0_5px_0_#d9dadc] font-headline text-xl font-bold cursor-pointer hover:bg-surface-container-low active:translate-y-1 transition-all"
            >
              0
            </button>

            {/* Pin Clear / Backspace */}
            <button
              id="pinClear"
              type="button"
              onClick={() => {
                sound.playTap();
                setEnteredPin((prev) => prev.slice(0, -1));
                setPinError(false);
              }}
              className="w-16 h-16 rounded-full bg-white border-2 border-[#EFE7D6] shadow-[0_5px_0_#d9dadc] flex items-center justify-center cursor-pointer hover:bg-surface-container-low active:translate-y-1 transition-all"
              aria-label="Delete last digit"
            >
              <span className="material-symbols-outlined text-2xl text-on-surface">backspace</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-sm font-bold text-on-surface-variant hover:text-on-surface underline mt-1"
          >
            ← Return to Kids Playground
          </button>
        </section>
      </main>
    );
  }

  // ==========================================
  // STITCH UNLOCKED PARENT CORNER DASHBOARD
  // ==========================================
  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 md:px-10 py-6 md:py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-headline text-sm font-bold text-tertiary tracking-wide uppercase">
            Parent Corner · Ages 2–6
          </span>
          <h1 className="font-headline text-[26px] md:text-[32px] font-bold text-on-surface mt-1">
            Reading Progress & Helper Controls
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="lockBtn"
            type="button"
            onClick={() => {
              sound.playTap();
              setEnteredPin('');
              setIsAuthenticated(false);
            }}
            className="h-12 px-5 rounded-full bg-white border-2 border-[#EFE7D6] shadow-[0_4px_0_#d9dadc] font-headline text-sm font-bold cursor-pointer hover:bg-surface-container-low active:translate-y-0.5 transition-all flex items-center gap-2 text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">lock</span>
            Lock Gate
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playChime();
              onClose();
            }}
            className="h-12 px-5 rounded-full bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e] font-headline text-sm font-bold cursor-pointer hover:bg-primary-fixed active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Return to App
          </button>
        </div>
      </div>

      {/* 3 Basic Stats Cards (Rule 4 requirement + Stitch Parent Corner) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Golden Keys Earned */}
        <div className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-5 shadow-[0_6px_0_rgba(30,32,34,0.05)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center shadow-[0_3px_0_#edc22e] text-on-primary-container flex-shrink-0">
            <span className="material-symbols-outlined text-3xl">key</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface-variant">Golden Keys Earned</div>
            <div className="font-headline text-3xl font-bold text-primary mt-1">
              {profile.earnedKeysCount || 1} / 12
            </div>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">Unlocked cartoon stories</p>
          </div>
        </div>

        {/* Metric 2: Words Mastered / Weekly Reading Time */}
        <div className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-5 shadow-[0_6px_0_rgba(30,32,34,0.05)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-tertiary-container flex items-center justify-center shadow-[0_3px_0_#006961] text-on-tertiary-container flex-shrink-0">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface-variant">Words Mastered</div>
            <div className="font-headline text-3xl font-bold text-on-surface mt-1">
              {profile.wordsLearnedCount} Words
            </div>
            <p className="text-xs text-on-surface-variant/70 mt-0.5">48 min active reading</p>
          </div>
        </div>

        {/* Metric 3: Accuracy Score & Day Streak */}
        <div className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-5 shadow-[0_6px_0_rgba(30,32,34,0.05)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center shadow-[0_3px_0_#ffdad9] text-secondary flex-shrink-0">
            <span className="material-symbols-outlined text-3xl">local_fire_department</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface-variant">Accuracy & Streak</div>
            <div className="font-headline text-2xl font-bold text-secondary mt-1">
              {profile.accuracyScore}% · {profile.dayStreak}d 🔥
            </div>
            <p className="text-xs text-secondary font-semibold mt-0.5">High confidence level</p>
          </div>
        </div>
      </div>

      {/* Navigation Pills for Tabs */}
      <nav className="flex flex-wrap items-center gap-2 bg-[#F4EBD9]/80 px-3 py-2 rounded-full w-fit">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setActiveTab('stats');
          }}
          className={`font-headline text-[13px] font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">mail</span>
          Weekly Report & Unlock
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setActiveTab('flashcards');
          }}
          className={`font-headline text-[13px] font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'flashcards'
              ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">print</span>
          Printable Flashcards
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setActiveTab('store');
          }}
          className={`font-headline text-[13px] font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'store'
              ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          Workbooks & PDFs
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTap();
            setActiveTab('settings');
          }}
          className={`font-headline text-[13px] font-bold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e]'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">schedule</span>
          Time & Bedtime Curfew
        </button>
      </nav>

      {/* ==================================================== */}
      {/* TAB 1: Weekly Progress Report & Unlock Codes (Lead Capture) */}
      {/* ==================================================== */}
      {activeTab === 'stats' && (
        <section className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center flex-shrink-0 shadow-[0_3px_0_#006961]">
              <span className="material-symbols-outlined text-2xl">mark_email_read</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Weekly Progress Report & Free Unlock Code
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                Enter your email to receive an automated weekly progress report for {profile.name}, plus an exclusive free code to unlock all cartoon episodes.
              </p>
            </div>
          </div>

          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="Enter parent email (e.g. parent@example.com)"
                className="flex-1 px-5 py-3.5 rounded-full bg-[#FDF8EE] border-2 border-[#d1c5ad] text-on-surface font-semibold focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-secondary-container text-white shadow-[0_4px_0_#b52234] font-headline text-sm font-bold cursor-pointer hover:bg-[#ff4250] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                Send Report & Get Free Code
              </button>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-[#ecfdf5] border-2 border-[#86efac] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-[#16a34a]">check_circle</span>
                <div>
                  <h4 className="font-headline font-bold text-[#14532d]">
                    Progress Report Queued for {parentEmail}!
                  </h4>
                  <p className="text-xs text-[#166534] font-semibold mt-0.5">
                    Your Free Episode Unlock Code is:{' '}
                    <span className="font-headline text-sm underline font-bold">{generatedUnlockCode}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUnlockAllEpisodes();
                  setCodeSuccess(true);
                  sound.playChime(1.2);
                }}
                className="px-5 py-2.5 rounded-full bg-[#22c55e] text-white font-headline text-xs font-bold shadow-[0_3px_0_#15803d] hover:bg-[#16a34a] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Apply Code Now
              </button>
            </div>
          )}

          {/* Episode Unlock Code Redemption */}
          <div className="pt-6 border-t border-[#F4EBD9]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-xl text-primary">key</span>
              <h3 className="font-headline text-lg font-bold text-on-surface">Redeem an Unlock Code</h3>
            </div>
            <p className="text-xs text-on-surface-variant font-medium mb-3">
              Codes received from email reports or promotional events unlock all locked YouTube episodes.
            </p>
            <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter unlock code (e.g. SPELLTOON or KIDSFREE)"
                className="px-5 py-3 rounded-full bg-[#FDF8EE] border-2 border-[#d1c5ad] font-bold uppercase text-on-surface tracking-wider focus:outline-none focus:border-primary max-w-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e] font-headline text-xs font-bold cursor-pointer hover:bg-primary-fixed active:translate-y-0.5 transition-all"
              >
                Unlock Episodes
              </button>
            </form>
            {codeSuccess && (
              <p className="text-[#15803d] font-bold text-sm mt-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">check</span>
                All episodes and activities unlocked!
              </p>
            )}
            {codeError && (
              <p className="text-[#b52234] font-bold text-sm mt-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">error</span>
                Code not recognized. Try <strong>SPELLTOON</strong> or <strong>KIDSFREE</strong>.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ==================================================== */}
      {/* TAB 2: Printable Flashcards (A4 Window Print) */}
      {/* ==================================================== */}
      {activeTab === 'flashcards' && (
        <section className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Printable Word Flashcards
              </h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                Print these cards at home on standard A4 paper for tactile, screen-free phonics practice.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                window.print();
              }}
              className="px-6 py-3 rounded-full bg-tertiary-container text-on-tertiary-container shadow-[0_4px_0_#006961] font-headline text-sm font-bold cursor-pointer hover:bg-[#4edacb] active:translate-y-0.5 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Print Flashcards (A4)
            </button>
          </div>

          {/* Flashcard Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
            {PRACTICED_FLASHCARDS.map((fc) => (
              <div
                key={fc.id}
                className="bg-[#FDF8EE] rounded-[20px] p-4 border-2 border-dashed border-[#d1c5ad] flex flex-col items-center text-center shadow-sm"
              >
                <span className="text-5xl mb-2">{fc.emoji}</span>
                <span className="font-headline text-xl font-bold tracking-wider text-on-surface">
                  {fc.word}
                </span>
                <span className="text-xs text-on-surface-variant font-mono mt-1 font-semibold">
                  {fc.phonics}
                </span>
                <span className="text-[10px] uppercase font-bold text-tertiary mt-1.5 tracking-wider">
                  {fc.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================== */}
      {/* TAB 3: Activity Workbooks & Storybooks (Monetization Shop) */}
      {/* ==================================================== */}
      {activeTab === 'store' && (
        <section className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] space-y-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Printable Activity Workbooks & Storybooks
            </h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Safe parent monetization. High-resolution PDF downloads ready for home printing and offline colouring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {PRINTABLE_WORKBOOKS.map((wb) => {
              const isPurchased = purchasedWorkbookIds.includes(wb.id);

              return (
                <div
                  key={wb.id}
                  className="bg-[#FDF8EE] rounded-[20px] p-6 border-2 border-[#EFE7D6] flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <span className="text-5xl mb-3 block">{wb.emoji}</span>
                    <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
                      {wb.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium mb-3">
                      {wb.description}
                    </p>
                    <span className="font-headline text-xs font-bold text-tertiary block mb-4">
                      {wb.pages} Printable Pages · High Res PDF
                    </span>
                  </div>

                  {isPurchased ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTap();
                        window.print();
                      }}
                      className="w-full py-3 rounded-full bg-[#22c55e] text-white shadow-[0_3px_0_#15803d] font-headline text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#16a34a] active:translate-y-0.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                      Download PDF Ready
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuyWorkbook(wb.id)}
                      className="w-full py-3 rounded-full bg-secondary-container text-white shadow-[0_4px_0_#b52234] font-headline text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#ff4250] active:translate-y-0.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-base">shopping_bag</span>
                      Buy Printable PDF ({wb.price})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================== */}
      {/* TAB 4: Time Limits & Bedtime Curfew */}
      {/* ==================================================== */}
      {activeTab === 'settings' && (
        <section className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-xl">timer</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Daily Screen Time Limit
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mb-4">
              SpellToon gently pauses with a soothing resting break when time completes.
            </p>
            <div className="flex flex-wrap gap-3">
              {[15, 30, 45, 60, 90].map((mins) => {
                const isSelected = profile.dailyLimitMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onUpdateProfile({ ...profile, dailyLimitMinutes: mins });
                    }}
                    className={`px-5 py-2.5 rounded-full font-headline text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e]'
                        : 'bg-[#FDF8EE] border-2 border-[#EFE7D6] text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {mins} Minutes
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-[#F4EBD9]" />

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-xl">bedtime</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">
                Bedtime Curfew Lock
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mb-4">
              Locks the screen with peaceful sleeping stars after this hour.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '7:00 PM', hour: 19, minute: 0 },
                { label: '7:30 PM', hour: 19, minute: 30 },
                { label: '8:00 PM', hour: 20, minute: 0 },
                { label: '8:30 PM', hour: 20, minute: 30 },
              ].map((bt) => {
                const isSelected =
                  profile.bedtimeHour === bt.hour && profile.bedtimeMinute === bt.minute;
                return (
                  <button
                    key={bt.label}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onUpdateProfile({
                        ...profile,
                        bedtimeHour: bt.hour,
                        bedtimeMinute: bt.minute,
                      });
                    }}
                    className={`px-5 py-2.5 rounded-full font-headline text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-secondary-fixed text-secondary shadow-[0_3px_0_#ffdad9]'
                        : 'bg-[#FDF8EE] border-2 border-[#EFE7D6] text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {bt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
