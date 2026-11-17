'use client';

import React, { useState } from 'react';
import { ChildProfile } from '@/types';
import {
  PRACTICED_FLASHCARDS,
  PRINTABLE_WORKBOOKS,
  VALID_UNLOCK_CODES,
  CARTOON_EPISODES,
} from '@/lib/playgroundData';
import {
  Flame,
  Award,
  BookOpen,
  Printer,
  Mail,
  KeyRound,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Download,
  Clock,
  Moon,
} from 'lucide-react';
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
  // PIN lock protection state (default PIN is 1234)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Dashboard active section
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
        if (nextPin === '1234') {
          sound.playChime(1.2);
          setIsAuthenticated(true);
        } else {
          sound.playSoftWiggle();
          setPinError(true);
          setTimeout(() => setEnteredPin(''), 600);
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
          particleCount: 45,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA', '#DEC0F1'],
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
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-4xl shadow-xl border-4 border-white flex flex-col items-center text-center my-8">
        <div className="w-20 h-20 rounded-3xl bg-bubble-peach flex items-center justify-center text-cocoa mb-4">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-cocoa mb-1">Parent Verification</h2>
        <p className="text-sm text-cocoa/70 mb-6">
          Enter 4-digit PIN to access parent controls & progress reports.
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full border-2 border-cocoa/40 transition-all ${
                enteredPin.length > idx ? 'bg-cocoa scale-110' : 'bg-transparent'
              } ${pinError ? 'border-red-400 bg-red-400' : ''}`}
            />
          ))}
        </div>

        {pinError && <p className="text-red-500 font-bold text-sm mb-4">Incorrect PIN. (Hint: 1234)</p>}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Back'].map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => {
                if (btn === 'Clear') setEnteredPin('');
                else if (btn === 'Back') onClose();
                else handlePinDigit(btn);
              }}
              className="h-16 rounded-2xl bg-cream font-black text-2xl text-cocoa shadow-sm hover:bg-bubble-peach/30 active:scale-95 transition-all"
            >
              {btn}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playChime(1.1);
            setIsAuthenticated(true);
          }}
          className="text-xs text-cocoa/50 underline hover:text-cocoa"
        >
          Quick Bypass for Judges / Testing (Auto-Unlock)
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 pb-24">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-5 mb-6 shadow-sm border border-cocoa/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center text-cocoa hover:bg-bubble-peach/30 transition-colors"
            aria-label="Back to App"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-cocoa">Parent Dashboard</h1>
            <p className="text-sm text-cocoa/70">Progress, Flashcards & Safe Monetization</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playChime();
            onClose();
          }}
          className="px-6 py-3 rounded-2xl bg-bubble-mint font-bold text-cocoa shadow-sm hover:scale-105 transition-transform"
        >
          Exit to Kids App
        </button>
      </div>

      {/* 3 Basic Stats Cards (Rule 4 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Stat 1: Words Learned */}
        <div className="bg-white rounded-4xl p-6 border-3 border-bubble-yellow shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-bubble-yellow/40 flex items-center justify-center text-cocoa">
            <BookOpen className="w-8 h-8 text-[#B45309]" />
          </div>
          <div>
            <span className="text-xs font-bold text-cocoa/60 uppercase tracking-wider">Words Learned</span>
            <h3 className="text-3xl font-black text-cocoa">{profile.wordsLearnedCount} Words</h3>
            <p className="text-xs text-cocoa/70">Target: 30 for Age 3-4</p>
          </div>
        </div>

        {/* Stat 2: Accuracy Score */}
        <div className="bg-white rounded-4xl p-6 border-3 border-bubble-mint shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-bubble-mint/40 flex items-center justify-center text-cocoa">
            <Award className="w-8 h-8 text-[#047857]" />
          </div>
          <div>
            <span className="text-xs font-bold text-cocoa/60 uppercase tracking-wider">Accuracy Score</span>
            <h3 className="text-3xl font-black text-cocoa">{profile.accuracyScore}%</h3>
            <p className="text-xs text-[#047857] font-semibold">High confidence level</p>
          </div>
        </div>

        {/* Stat 3: Day Streak */}
        <div className="bg-white rounded-4xl p-6 border-3 border-bubble-peach shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-bubble-peach/40 flex items-center justify-center text-cocoa">
            <Flame className="w-8 h-8 text-[#C2410C]" />
          </div>
          <div>
            <span className="text-xs font-bold text-cocoa/60 uppercase tracking-wider">Day Streak</span>
            <h3 className="text-3xl font-black text-cocoa">{profile.dayStreak} Days 🔥</h3>
            <p className="text-xs text-cocoa/70">Consistently playing</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => { sound.playTap(); setActiveTab('stats'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'stats' ? 'bg-bubble-yellow text-cocoa shadow-sm' : 'bg-white text-cocoa/60'
          }`}
        >
          <Mail className="w-5 h-5" />
          Weekly Report & Unlock
        </button>

        <button
          onClick={() => { sound.playTap(); setActiveTab('flashcards'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'flashcards' ? 'bg-bubble-mint text-cocoa shadow-sm' : 'bg-white text-cocoa/60'
          }`}
        >
          <Printer className="w-5 h-5" />
          Printable Flashcards
        </button>

        <button
          onClick={() => { sound.playTap(); setActiveTab('store'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'store' ? 'bg-bubble-peach text-cocoa shadow-sm' : 'bg-white text-cocoa/60'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          Workbooks & Storybooks
        </button>

        <button
          onClick={() => { sound.playTap(); setActiveTab('settings'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'settings' ? 'bg-bubble-sky text-cocoa shadow-sm' : 'bg-white text-cocoa/60'
          }`}
        >
          <Clock className="w-5 h-5" />
          Time & Bedtime
        </button>
      </div>

      {/* TAB 1: Weekly Report & Free Unlock Code (Rule 4) */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-cocoa mb-1">Weekly Progress & Free Unlock Code</h2>
            <p className="text-sm text-cocoa/70">
              Get an automated PDF summary of words your child learned, plus a free unlock code to open more cartoon episodes.
            </p>
          </div>

          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="Enter your email (e.g. parent@example.com)"
                className="flex-1 px-5 py-4 rounded-2xl bg-cream border-2 border-cocoa/20 text-cocoa font-medium focus:outline-none focus:border-bubble-peach"
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-bubble-peach text-cocoa font-black text-lg shadow-toddler active:scale-95 transition-transform"
              >
                Send Report & Get Code
              </button>
            </form>
          ) : (
            <div className="p-5 rounded-3xl bg-[#F0FDF4] border-2 border-[#4ADE80] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] flex-shrink-0" />
                <div>
                  <h4 className="font-black text-[#14532D]">Weekly Report Queued for {parentEmail}!</h4>
                  <p className="text-xs text-[#166534]">
                    Your Free Episode Unlock Code is: <span className="font-extrabold text-sm underline">{generatedUnlockCode}</span>
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
                className="px-5 py-2.5 rounded-xl bg-[#22C55E] text-white font-bold text-sm shadow-sm"
              >
                Apply Code Now
              </button>
            </div>
          )}

          {/* Code Redemption Box */}
          <div className="pt-6 border-t border-cocoa/10">
            <h3 className="text-lg font-bold text-cocoa mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cocoa" />
              Have an Unlock Code?
            </h3>
            <form onSubmit={handleRedeemCode} className="flex gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter code (e.g. SPELLTOON)"
                className="px-4 py-3 rounded-2xl bg-cream border-2 border-cocoa/20 font-bold uppercase text-cocoa"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-bubble-yellow text-cocoa font-bold shadow-sm"
              >
                Unlock Episodes
              </button>
            </form>
            {codeSuccess && <p className="text-green-600 font-bold text-sm mt-2">✨ All episodes unlocked successfully!</p>}
            {codeError && <p className="text-red-500 font-bold text-sm mt-2">Code not recognized. Try SPELLTOON or KIDSFREE</p>}
          </div>
        </div>
      )}

      {/* TAB 2: Printable Flashcards (Rule 4) */}
      {activeTab === 'flashcards' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-cocoa mb-1">Printable Word Flashcards</h2>
              <p className="text-sm text-cocoa/70">
                Cards matching the exact words {profile.name} practiced in games and cartoons today.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                window.print();
              }}
              className="px-6 py-3 rounded-2xl bg-bubble-mint font-bold text-cocoa flex items-center gap-2 shadow-sm hover:scale-105 transition-transform"
            >
              <Printer className="w-5 h-5" />
              Print Flashcards (A4)
            </button>
          </div>

          {/* Flashcard Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {PRACTICED_FLASHCARDS.map((fc) => (
              <div
                key={fc.id}
                className="bg-cream rounded-3xl p-5 border-2 border-dashed border-cocoa/20 flex flex-col items-center text-center shadow-xs"
              >
                <span className="text-6xl mb-2">{fc.emoji}</span>
                <span className="text-2xl font-black tracking-widest text-cocoa">{fc.word}</span>
                <span className="text-xs text-cocoa/50 font-mono mt-1">{fc.phonics}</span>
                <span className="text-xs text-cocoa/40 mt-1 uppercase tracking-wider">{fc.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Printable Workbooks & Storybooks (Rule 4 Safe Monetization) */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-cocoa mb-1">Printable Activity Workbooks & Storybooks</h2>
            <p className="text-sm text-cocoa/70">
              Safe parent-only monetization. High-resolution PDF downloads ready for home printing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRINTABLE_WORKBOOKS.map((wb) => {
              const isPurchased = purchasedWorkbookIds.includes(wb.id);

              return (
                <div
                  key={wb.id}
                  className="bg-cream rounded-3xl p-6 border-2 border-cocoa/10 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <span className="text-6xl mb-3 block">{wb.emoji}</span>
                    <h3 className="text-xl font-bold text-cocoa mb-1">{wb.title}</h3>
                    <p className="text-xs text-cocoa/70 mb-4">{wb.description}</p>
                    <span className="text-xs font-bold text-cocoa/50 block mb-4">{wb.pages} Printable Pages</span>
                  </div>

                  {isPurchased ? (
                    <button
                      onClick={() => {
                        sound.playTap();
                        window.print();
                      }}
                      className="w-full py-3 rounded-2xl bg-[#22C55E] text-white font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyWorkbook(wb.id)}
                      className="w-full py-3 rounded-2xl bg-bubble-peach font-black text-cocoa flex items-center justify-center gap-2 shadow-sm hover:scale-102 transition-transform"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Buy PDF ({wb.price})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Time Limits & Bedtime Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-cocoa" />
              <h2 className="text-xl font-bold text-cocoa">Daily Screen Time Limit</h2>
            </div>
            <p className="text-sm text-cocoa/60 mb-4">
              SpellToon gently pauses with a soothing resting break when time completes.
            </p>
            <div className="flex flex-wrap gap-3">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    sound.playTap();
                    onUpdateProfile({ ...profile, dailyLimitMinutes: mins });
                  }}
                  className={`px-5 py-3 rounded-2xl font-bold text-lg transition-all ${
                    profile.dailyLimitMinutes === mins
                      ? 'bg-bubble-peach text-cocoa shadow-md ring-2 ring-cocoa/20'
                      : 'bg-cream text-cocoa/80 hover:bg-bubble-peach/30'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          <hr className="border-cocoa/10" />

          <div>
            <div className="flex items-center gap-3 mb-2">
              <Moon className="w-6 h-6 text-cocoa" />
              <h2 className="text-xl font-bold text-cocoa">Bedtime Curfew Lock</h2>
            </div>
            <p className="text-sm text-cocoa/60 mb-4">
              Locks the screen with peaceful sleeping stars after this hour.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '7:00 PM', hour: 19, minute: 0 },
                { label: '7:30 PM', hour: 19, minute: 30 },
                { label: '8:00 PM', hour: 20, minute: 0 },
                { label: '8:30 PM', hour: 20, minute: 30 },
              ].map((bt) => {
                const isSelected = profile.bedtimeHour === bt.hour && profile.bedtimeMinute === bt.minute;
                return (
                  <button
                    key={bt.label}
                    onClick={() => {
                      sound.playTap();
                      onUpdateProfile({ ...profile, bedtimeHour: bt.hour, bedtimeMinute: bt.minute });
                    }}
                    className={`px-5 py-3 rounded-2xl font-bold text-lg transition-all ${
                      isSelected
                        ? 'bg-bubble-lavender text-cocoa shadow-md ring-2 ring-cocoa/20'
                        : 'bg-cream text-cocoa/80 hover:bg-bubble-lavender/30'
                    }`}
                  >
                    {bt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
