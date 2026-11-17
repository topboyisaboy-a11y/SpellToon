'use client';

import React, { useState, useRef } from 'react';
import { COLORING_PAGES, PALETTE_COLORS } from '@/lib/mockData';
import { ColoringPage } from '@/types';
import { sound } from '@/lib/audioEngine';
import { RotateCcw, Trash2, Paintbrush, Pipette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stroke {
  color: string;
  points: { x: number; y: number }[];
}

export const ColoringCanvas: React.FC = () => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePage = COLORING_PAGES[activePageIndex];

  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0].hex);
  const [toolMode, setToolMode] = useState<'fill' | 'brush'>('fill');

  // Fill state per region: regionId -> color hex
  const [regionFills, setRegionFills] = useState<Record<string, string>>({});
  // Freehand strokes
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Undo history
  const [history, setHistory] = useState<{ fills: Record<string, string>; strokes: Stroke[] }[]>([]);

  const handlePaletteSelect = (name: string, hex: string) => {
    sound.playTap();
    sound.speak(name);
    setSelectedColor(hex);
  };

  const handleRegionClick = (regionId: string, regionName: string) => {
    if (toolMode !== 'fill') return;

    sound.playPop();
    sound.speak(`${regionName}!`);

    // Record history
    setHistory((prev) => [...prev.slice(-20), { fills: { ...regionFills }, strokes: [...strokes] }]);

    setRegionFills((prev) => {
      const updated = { ...prev, [regionId]: selectedColor };

      // Check if all regions of the page are colored!
      const allFilled = activePage.regions.every((r) => updated[r.id]);
      if (allFilled) {
        setTimeout(() => {
          sound.playChime(1.2);
          sound.speak('Beautiful artwork!');
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA', '#F7CAD0'],
              disableForReducedMotion: true,
            });
          } catch {}
        }, 300);
      }

      return updated;
    });
  };

  // Drawing event handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (toolMode !== 'brush') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    isDrawingRef.current = true;
    const newStroke: Stroke = { color: selectedColor, points: [{ x, y }] };
    currentStrokeRef.current = newStroke;

    setHistory((prev) => [...prev.slice(-20), { fills: { ...regionFills }, strokes: [...strokes] }]);
    setStrokes((prev) => [...prev, newStroke]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current || toolMode !== 'brush') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    currentStrokeRef.current.points.push({ x, y });
    setStrokes((prev) => [...prev.slice(0, -1), { ...currentStrokeRef.current! }]);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    currentStrokeRef.current = null;
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    sound.playTap();
    sound.speak('Undo');
    const last = history[history.length - 1];
    setRegionFills(last.fills);
    setStrokes(last.strokes);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sound.playTap();
    sound.speak('Clear Page');
    setHistory((prev) => [...prev.slice(-20), { fills: { ...regionFills }, strokes: [...strokes] }]);
    setRegionFills({});
    setStrokes([]);
  };

  const switchPage = (idx: number) => {
    sound.playTap();
    sound.speak(COLORING_PAGES[idx].name);
    setActivePageIndex(idx);
    setRegionFills({});
    setStrokes([]);
    setHistory([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Top Controls: Page switcher & Tool Mode */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Page Switcher */}
        <div className="flex gap-3">
          {COLORING_PAGES.map((pg, idx) => (
            <button
              key={pg.id}
              onClick={() => switchPage(idx)}
              className={`min-w-touch min-h-touch px-5 py-2 rounded-3xl text-3xl flex items-center justify-center transition-transform shadow-toddler ${
                activePageIndex === idx ? 'bg-bubble-yellow ring-4 ring-white scale-105' : 'bg-white'
              }`}
            >
              {pg.emoji}
            </button>
          ))}
        </div>

        {/* Tool Mode: Tap-Fill vs Brush */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              sound.playTap();
              sound.speak('Fill tool');
              setToolMode('fill');
            }}
            className={`min-w-touch min-h-touch px-6 py-2 rounded-3xl font-black text-lg flex items-center gap-2 shadow-toddler transition-all ${
              toolMode === 'fill' ? 'bg-bubble-peach ring-4 ring-white scale-105' : 'bg-white text-cocoa/60'
            }`}
          >
            <Pipette className="w-7 h-7" />
            Fill
          </button>

          <button
            onClick={() => {
              sound.playTap();
              sound.speak('Paint Brush');
              setToolMode('brush');
            }}
            className={`min-w-touch min-h-touch px-6 py-2 rounded-3xl font-black text-lg flex items-center gap-2 shadow-toddler transition-all ${
              toolMode === 'brush' ? 'bg-bubble-sky ring-4 ring-white scale-105' : 'bg-white text-cocoa/60'
            }`}
          >
            <Paintbrush className="w-7 h-7" />
            Brush
          </button>
        </div>

        {/* Undo & Clear */}
        <div className="flex gap-3">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="min-w-touch min-h-touch w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-toddler disabled:opacity-40"
            aria-label="Undo"
          >
            <RotateCcw className="w-8 h-8 text-cocoa" />
          </button>

          <button
            onClick={handleClear}
            className="min-w-touch min-h-touch w-20 h-20 rounded-3xl bg-bubble-pink flex items-center justify-center shadow-toddler"
            aria-label="Clear page"
          >
            <Trash2 className="w-8 h-8 text-cocoa" />
          </button>
        </div>
      </div>

      {/* SVG Coloring Canvas */}
      <div className="relative w-full max-w-2xl aspect-[5/4] bg-white rounded-4xl border-4 border-white shadow-xl overflow-hidden mb-6 touch-none">
        <svg
          viewBox={activePage.viewBox}
          className="w-full h-full cursor-pointer select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* SVG Fillable Regions */}
          {activePage.regions.map((region) => {
            const fillColor = regionFills[region.id] || region.defaultColor || '#FFFDF5';
            return (
              <path
                key={region.id}
                d={region.d}
                fill={fillColor}
                stroke="#4A3E3D"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-200 hover:opacity-90 active:scale-98"
                onClick={() => handleRegionClick(region.id, region.name)}
              />
            );
          })}

          {/* Freehand Brush Layer */}
          {strokes.map((s, idx) => {
            if (s.points.length < 2) return null;
            const pathData = s.points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ');
            return (
              <path
                key={idx}
                d={pathData}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>

      {/* Oversized Color Palette (Each button >= 80px touch target) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-4xl shadow-sm border border-cocoa/10">
        {PALETTE_COLORS.map((col) => {
          const isSelected = selectedColor === col.hex;
          return (
            <button
              key={col.hex}
              type="button"
              onClick={() => handlePaletteSelect(col.name, col.hex)}
              style={{ backgroundColor: col.hex }}
              className={`min-w-touch min-h-touch w-20 h-20 rounded-3xl border-4 transition-all shadow-toddler cursor-pointer ${
                isSelected ? 'border-cocoa scale-110 shadow-lg' : 'border-white hover:scale-105'
              }`}
            >
              {isSelected && <span className="text-2xl drop-shadow">✨</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
