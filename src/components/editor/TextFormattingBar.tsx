"use client";

import React from "react";
import type { CanvasConfig } from "@/types";

interface TextFormattingBarProps {
  selectedConfig: CanvasConfig | null;
  onUpdateConfigAction: (updated: CanvasConfig) => void;
  onDeleteConfigAction: (id: string) => void;
}

const FONT_FAMILIES = [
  { label: "Inter (Sans)", value: "Inter" },
  { label: "Georgia (Serif)", value: "Georgia" },
  { label: "Courier (Mono)", value: "Courier New" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Cinzel (Classic)", value: "Cinzel" },
  { label: "Montserrat", value: "Montserrat" },
];

const PRESET_COLORS = [
  "#111827", // Dark Slate
  "#1e3a8a", // Deep Blue
  "#047857", // Emerald
  "#b45309", // Amber Gold
  "#4c1d95", // Royal Purple
  "#b91c1c", // Crimson
];

export default function TextFormattingBar({
  selectedConfig,
  onUpdateConfigAction,
  onDeleteConfigAction,
}: TextFormattingBarProps) {
  if (!selectedConfig) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-center text-xs text-gray-400 backdrop-blur-sm">
        💡 Select or drag any variable text element on the canvas to customize fonts, colors, and positioning.
      </div>
    );
  }

  const handleChange = <K extends keyof CanvasConfig>(
    key: K,
    value: CanvasConfig[K]
  ) => {
    onUpdateConfigAction({
      ...selectedConfig,
      [key]: value,
    });
  };

  return (
    <div className="card border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-md animate-fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-primary-500 animate-pulse" />
          <h4 className="font-display text-sm font-bold text-gray-900">
            Active Variable:{" "}
            <span className="text-primary-600 font-mono">
              {"{"}
              {selectedConfig.variableName}
              {"}"}
            </span>
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onDeleteConfigAction(selectedConfig.id)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          title="Remove element from canvas"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Remove Field
        </button>
      </div>

      {/* Custom Text / Role Override section */}
      <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-200/60 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <label htmlFor="custom-text-override" className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Admin Text / Role Override (Optional)
          </label>
          <input
            id="custom-text-override"
            type="text"
            value={selectedConfig.customText || ""}
            onChange={(e) => handleChange("customText", e.target.value)}
            placeholder={`Override {${selectedConfig.variableName}} with fixed custom text...`}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {selectedConfig.variableName === "Role" && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] font-semibold text-gray-400 mr-1">Quick Role Presets:</span>
            {["Participant", "Winner", "Runner-up", "Speaker", "Organizer"].map((presetRole) => (
              <button
                key={presetRole}
                type="button"
                onClick={() => handleChange("customText", presetRole)}
                className="rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-700 border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all shadow-sm"
              >
                {presetRole}
              </button>
            ))}
            {selectedConfig.customText && (
              <button
                type="button"
                onClick={() => handleChange("customText", "")}
                className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
                title="Reset to dynamic CSV role"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 items-center">
        {/* 1. Font Family */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Font Family
          </label>
          <select
            value={selectedConfig.fontFamily}
            onChange={(e) => handleChange("fontFamily", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Font Size Slider */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            <span>Font Size</span>
            <span className="font-mono text-gray-900">{selectedConfig.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="120"
            value={selectedConfig.fontSize}
            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        {/* 3. Text Alignment */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Alignment
          </label>
          <div className="flex rounded-xl border border-gray-200 bg-white p-0.5">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleChange("alignment", align)}
                className={`flex-1 rounded-lg py-1 text-[11px] font-semibold capitalize transition-all ${
                  selectedConfig.alignment === align
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Hex Color Picker */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedConfig.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="h-8 w-8 cursor-pointer rounded-lg border border-gray-200 p-0.5 bg-white"
            />
            <div className="flex gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange("color", c)}
                  className="h-5 w-5 rounded-full border border-white shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 5. Fine-Tune X Position */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            <span>X Pos</span>
            <button
              type="button"
              onClick={() => {
                handleChange("x", 600);
                handleChange("alignment", "center");
              }}
              className="text-[9px] text-primary-600 hover:text-primary-800 underline font-semibold"
              title="Snap to horizontal center (x: 600)"
            >
              Snap 600px
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleChange("x", Math.max(0, selectedConfig.x - 5))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              value={Math.round(selectedConfig.x)}
              onChange={(e) => handleChange("x", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-center text-gray-900 outline-none"
            />
            <button
              type="button"
              onClick={() => handleChange("x", selectedConfig.x + 5)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* 6. Fine-Tune Y Position */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Y Offset (px)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleChange("y", Math.max(0, selectedConfig.y - 5))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              value={Math.round(selectedConfig.y)}
              onChange={(e) => handleChange("y", Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-center text-gray-900 outline-none"
            />
            <button
              type="button"
              onClick={() => handleChange("y", selectedConfig.y + 5)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
