'use client';

import React, { useState } from 'react';
import { ChildProfile } from '@/types';
import { Clock, Moon, BarChart3, Users, Check, ArrowLeft } from 'lucide-react';
import { sound } from '@/lib/audioEngine';

interface ParentDashboardProps {
  profile: ChildProfile;
  onUpdateProfile: (updated: ChildProfile) => void;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'limits' | 'stats'>('profile');

  const timeLimits = [15, 30, 45, 60, 90];
  const bedtimes = [
    { label: '7:00 PM', hour: 19, minute: 0 },
    { label: '7:30 PM', hour: 19, minute: 30 },
    { label: '8:00 PM', hour: 20, minute: 0 },
    { label: '8:30 PM', hour: 20, minute: 30 },
  ];

  const handleTimeLimitChange = (minutes: number) => {
    sound.playTap();
    onUpdateProfile({ ...profile, dailyLimitMinutes: minutes });
  };

  const handleBedtimeChange = (hour: number, minute: number) => {
    sound.playTap();
    onUpdateProfile({ ...profile, bedtimeHour: hour, bedtimeMinute: minute });
  };

  const handleAvatarChange = (avatar: string) => {
    sound.playTap();
    onUpdateProfile({ ...profile, avatarEmoji: avatar });
  };

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
            <p className="text-sm text-cocoa/70">Manage settings, limits & insights for {profile.name}</p>
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

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { sound.playTap(); setActiveTab('profile'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-bubble-yellow text-cocoa shadow-sm'
              : 'bg-white text-cocoa/60 hover:bg-cream'
          }`}
        >
          <Users className="w-5 h-5" />
          Child Profile
        </button>

        <button
          onClick={() => { sound.playTap(); setActiveTab('limits'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'limits'
              ? 'bg-bubble-peach text-cocoa shadow-sm'
              : 'bg-white text-cocoa/60 hover:bg-cream'
          }`}
        >
          <Clock className="w-5 h-5" />
          Screen Time & Bedtime
        </button>

        <button
          onClick={() => { sound.playTap(); setActiveTab('stats'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-bubble-sky text-cocoa shadow-sm'
              : 'bg-white text-cocoa/60 hover:bg-cream'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Weekly Summary
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-6">
          <h2 className="text-xl font-bold text-cocoa">Active Child Profile</h2>
          
          <div className="flex items-center gap-6 p-4 rounded-3xl bg-cream border border-cocoa/10">
            <span className="text-6xl p-4 bg-white rounded-3xl shadow-sm">{profile.avatarEmoji}</span>
            <div>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                className="text-2xl font-black text-cocoa bg-transparent border-b-2 border-bubble-peach focus:outline-none"
              />
              <p className="text-sm text-cocoa/60 mt-1">Stickers Collected: {profile.unlockedStickerIds.length}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-cocoa/80 mb-3">Choose Avatar</label>
            <div className="flex flex-wrap gap-4">
              {['🦁', '🐰', '🐶', '🐱', '🐼', '🦊', '🐸'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAvatarChange(emoji)}
                  className={`w-16 h-16 rounded-2xl text-3xl flex items-center justify-center transition-transform ${
                    profile.avatarEmoji === emoji
                      ? 'bg-bubble-yellow ring-4 ring-cocoa/20 scale-105'
                      : 'bg-cream hover:bg-bubble-peach/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Screen Time & Bedtime */}
      {activeTab === 'limits' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-cocoa" />
              <h2 className="text-xl font-bold text-cocoa">Daily Screen Time Limit</h2>
            </div>
            <p className="text-sm text-cocoa/60 mb-4">
              Once this time elapses, SpellToon gently invites the child to pause with a friendly break screen.
            </p>
            <div className="flex flex-wrap gap-3">
              {timeLimits.map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleTimeLimitChange(mins)}
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
              <h2 className="text-xl font-bold text-cocoa">Bedtime Lockout</h2>
            </div>
            <p className="text-sm text-cocoa/60 mb-4">
              Locks the app with a peaceful night sky and lullaby prompt after your chosen evening hour.
            </p>
            <div className="flex flex-wrap gap-3">
              {bedtimes.map((bt) => {
                const isSelected = profile.bedtimeHour === bt.hour && profile.bedtimeMinute === bt.minute;
                return (
                  <button
                    key={bt.label}
                    onClick={() => handleBedtimeChange(bt.hour, bt.minute)}
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

      {/* Tab 3: Weekly Summary */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-4xl p-6 md:p-8 shadow-sm border border-cocoa/10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-cocoa mb-1">Weekly Usage Summary</h2>
            <p className="text-sm text-cocoa/60">Minutes explored across activities this week</p>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-48 pt-6 pb-2 border-b border-cocoa/10">
            {[
              { day: 'Mon', mins: 15 },
              { day: 'Tue', mins: 25 },
              { day: 'Wed', mins: 20 },
              { day: 'Thu', mins: 30 },
              { day: 'Fri', mins: 18 },
              { day: 'Sat', mins: 35 },
              { day: 'Sun', mins: 22 },
            ].map((col) => (
              <div key={col.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-cocoa/60">{col.mins}m</span>
                <div
                  className="w-full bg-bubble-mint rounded-t-xl transition-all"
                  style={{ height: `${(col.mins / 40) * 100}%` }}
                />
                <span className="text-xs font-bold text-cocoa/80">{col.day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-3xl bg-bubble-yellow/40">
              <span className="text-2xl">🧩</span>
              <p className="text-xs font-bold text-cocoa/70 mt-1">Top Activity</p>
              <p className="text-lg font-black text-cocoa">Picture Quiz</p>
            </div>
            <div className="p-4 rounded-3xl bg-bubble-pink/40">
              <span className="text-2xl">🎨</span>
              <p className="text-xs font-bold text-cocoa/70 mt-1">Colorings Finished</p>
              <p className="text-lg font-black text-cocoa">4 Artworks</p>
            </div>
            <div className="p-4 rounded-3xl bg-bubble-sky/40">
              <span className="text-2xl">🫧</span>
              <p className="text-xs font-bold text-cocoa/70 mt-1">Bubbles Popped</p>
              <p className="text-lg font-black text-cocoa">68 Bubbles</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
