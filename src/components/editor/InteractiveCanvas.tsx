"use client";

import React, { useRef, useState, useEffect } from "react";
import type { CanvasConfig, CertificateEvent, CsvRow } from "@/types";
import { PRESET_TEMPLATES } from "@/utils/defaultTemplates";

// ─── Logical Canvas Dimensions (1200 × 800) ──────────────────────────────────
// Fixed internal coordinate system shared 1:1 between editor, viewer, and exports.
const CANVAS_W = 1200;
const CANVAS_H = 800;

interface InteractiveCanvasProps {
  event: CertificateEvent;
  canvasConfigs: CanvasConfig[];
  selectedConfigId: string | null;
  isPreviewMode: boolean;
  onSelectConfigAction: (id: string | null) => void;
  onUpdateConfigsAction: (configs: CanvasConfig[]) => void;
}

export default function InteractiveCanvas({
  event,
  canvasConfigs,
  selectedConfigId,
  isPreviewMode,
  onSelectConfigAction,
  onUpdateConfigsAction,
}: InteractiveCanvasProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Responsive scale factor so the entire certificate is visible at once (no sliding)
  const [scale, setScale] = useState<number>(0.75);
  const [viewMode, setViewMode] = useState<"fit" | "actual">("fit");

  // Custom field adder input state
  const [customInputText, setCustomInputText] = useState<string>("");
  // Column search filter
  const [columnSearch, setColumnSearch] = useState<string>("");

  // Effective template background (defaulting to SIEC preset if none uploaded)
  const effectiveImageUrl = event.baseImageUrl || PRESET_TEMPLATES[0].dataUrl;

  // Auto-fit calculations based on container dimensions
  useEffect(() => {
    if (viewMode === "actual") {
      setScale(1);
      return;
    }

    const updateScale = () => {
      if (!wrapperRef.current) return;
      // Available width inside the wrapper
      const availableWidth = wrapperRef.current.clientWidth - 16;
      // Available viewport height bounded to keep entire certificate on-screen
      const availableHeight = Math.max(340, Math.min(window.innerHeight * 0.65, 750));

      const scaleByW = availableWidth / CANVAS_W;
      const scaleByH = availableHeight / CANVAS_H;

      // Fit completely within both width and height to eliminate any sliding
      const fitScale = Math.min(scaleByW, scaleByH);
      setScale(Math.max(0.2, Math.min(1.15, fitScale)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [viewMode]);

  // 1. Extract all unique column headers from uploaded CSV/Excel data
  const sheetColumns = React.useMemo(() => {
    if (!event.csvData || event.csvData.length === 0) return [];
    const keysSet = new Set<string>();
    event.csvData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        const trimmed = k.trim();
        if (trimmed) keysSet.add(trimmed);
      });
    });
    return Array.from(keysSet);
  }, [event.csvData]);

  // Sample participant row for live preview
  const sampleRow: CsvRow = event.csvData[0] || {};

  // Helper to get an appropriate icon and sample value for any column or field
  const getFieldMeta = (fieldName: string): { icon: string; sample: string } => {
    const lower = fieldName.toLowerCase();
    let icon = "🏷️";
    if (lower.includes("name")) icon = "👤";
    else if (lower.includes("mail")) icon = "✉️";
    else if (lower.includes("role") || lower.includes("designation")) icon = "🏅";
    else if (lower.includes("date") || lower.includes("time")) icon = "🗓️";
    else if (lower.includes("id") || lower.includes("code") || lower.includes("num") || lower.includes("roll")) icon = "🔑";
    else if (lower.includes("college") || lower.includes("univ") || lower.includes("school") || lower.includes("dept") || lower.includes("inst") || lower.includes("branch")) icon = "🏛️";
    else if (lower.includes("rank") || lower.includes("prize") || lower.includes("score") || lower.includes("grade") || lower.includes("pos")) icon = "🏆";
    else if (lower.includes("event") || lower.includes("title") || lower.includes("topic")) icon = "📅";
    else if (lower.includes("sign") || lower.includes("mentor") || lower.includes("head") || lower.includes("lead")) icon = "✍️";

    let sample = "";
    if (sampleRow[fieldName] !== undefined && sampleRow[fieldName] !== "") {
      sample = String(sampleRow[fieldName]);
    } else {
      const keyMatch = Object.keys(sampleRow).find(
        (k) => k.trim().toLowerCase() === fieldName.trim().toLowerCase()
      );
      if (keyMatch && sampleRow[keyMatch] !== undefined && sampleRow[keyMatch] !== "") {
        sample = String(sampleRow[keyMatch]);
      } else {
        sample = "Sample " + fieldName;
      }
    }

    return { icon, sample };
  };

  // Standard system fields
  const SYSTEM_FIELDS = [
    { name: "Event Name", sample: event.eventName || "SIEC Event 2026", icon: "📅" },
    {
      name: "Issue Date",
      sample: new Date(event.eventDate || Date.now()).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      icon: "🗓️",
    },
    { name: "Certificate ID", sample: "CERT-89421", icon: "🔑" },
  ];

  // If sheet doesn't contain a column that includes "name", offer Participant Name
  const hasNameInSheet = sheetColumns.some((col) =>
    col.toLowerCase().includes("name")
  );
  if (!hasNameInSheet) {
    SYSTEM_FIELDS.unshift({
      name: "Participant Name",
      sample: sampleRow.name || "Aarav Sharma",
      icon: "👤",
    });
  }

  // Value resolution for preview and canvas rendering
  const getDisplayValue = (config: CanvasConfig): string => {
    if (config.customText !== undefined && config.customText.trim() !== "") {
      return config.customText;
    }

    const { variableName } = config;
    if (!isPreviewMode) return `{${variableName}}`;

    switch (variableName) {
      case "Participant Name":
        return (
          sampleRow.name ||
          sampleRow.Name ||
          sampleRow["Participant Name"] ||
          sampleRow["participant name"] ||
          "Aarav Sharma"
        );
      case "Event Name":
        return event.eventName || "SIEC Event 2026";
      case "Role":
        return sampleRow.role || sampleRow.Role || "Participant";
      case "Issue Date":
        return (
          sampleRow.issueDate ||
          sampleRow.IssueDate ||
          sampleRow.date ||
          sampleRow.Date ||
          new Date(event.eventDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );
      case "Certificate ID":
        return "CERT-89421";
      default: {
        // 1. Direct match
        if (sampleRow[variableName] !== undefined && sampleRow[variableName] !== "") {
          return String(sampleRow[variableName]);
        }
        // 2. Case-insensitive key match
        const matchedKey = Object.keys(sampleRow).find(
          (k) => k.trim().toLowerCase() === variableName.trim().toLowerCase()
        );
        if (
          matchedKey &&
          sampleRow[matchedKey] !== undefined &&
          sampleRow[matchedKey] !== ""
        ) {
          return String(sampleRow[matchedKey]);
        }
        return `{${variableName}}`;
      }
    }
  };

  // Remove a config field from canvas
  const handleRemoveConfig = (id: string) => {
    const updated = canvasConfigs.filter((c) => c.id !== id);
    onUpdateConfigsAction(updated);
    if (selectedConfigId === id) {
      onSelectConfigAction(null);
    }
  };

  // Add a chip to canvas centered horizontally at x = 600
  const handleAddChip = (chipName: string) => {
    const existing = canvasConfigs.find(
      (c) => c.variableName.toLowerCase() === chipName.trim().toLowerCase()
    );
    if (existing) {
      onSelectConfigAction(existing.id);
      return;
    }

    const isName = chipName.toLowerCase().includes("name");
    const newConfig: CanvasConfig = {
      id: `cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      variableName: chipName.trim(),
      x: 600,
      y: Math.min(740, 240 + canvasConfigs.length * 50),
      fontSize: isName ? 36 : 22,
      fontFamily: "Inter",
      color: isName ? "#111827" : "#374151",
      alignment: "center",
    };

    const updated = [...canvasConfigs, newConfig];
    onUpdateConfigsAction(updated);
    onSelectConfigAction(newConfig.id);
  };

  // ─── Scale-Aware Drag Handlers ──────────────────────────────────────────
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    config: CanvasConfig
  ) => {
    e.stopPropagation();
    onSelectConfigAction(config.id);
    setDraggingId(config.id);

    if (!canvasContainerRef.current) return;
    const containerRect = canvasContainerRef.current.getBoundingClientRect();
    const currentScale = containerRect.width / CANVAS_W;
    const mouseCanvasX = (e.clientX - containerRect.left) / currentScale;
    const mouseCanvasY = (e.clientY - containerRect.top) / currentScale;

    setDragOffset({
      x: mouseCanvasX - config.x,
      y: mouseCanvasY - config.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !canvasContainerRef.current) return;

    const containerRect = canvasContainerRef.current.getBoundingClientRect();
    const currentScale = containerRect.width / CANVAS_W;
    const mouseCanvasX = (e.clientX - containerRect.left) / currentScale;
    const mouseCanvasY = (e.clientY - containerRect.top) / currentScale;

    const newX = mouseCanvasX - dragOffset.x;
    const newY = mouseCanvasY - dragOffset.y;

    const clampedX = Math.max(10, Math.min(CANVAS_W - 10, Math.round(newX)));
    const clampedY = Math.max(10, Math.min(CANVAS_H - 10, Math.round(newY)));

    const updated = canvasConfigs.map((cfg) =>
      cfg.id === draggingId ? { ...cfg, x: clampedX, y: clampedY } : cfg
    );
    onUpdateConfigsAction(updated);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  // HTML5 Drag and drop from sidebar onto canvas container
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const chipName = e.dataTransfer.getData("chipName");
    if (!chipName || !canvasContainerRef.current) return;

    const containerRect = canvasContainerRef.current.getBoundingClientRect();
    const currentScale = containerRect.width / CANVAS_W;
    const dropX = Math.round(
      Math.max(10, Math.min(CANVAS_W - 10, (e.clientX - containerRect.left) / currentScale))
    );
    const dropY = Math.round(
      Math.max(10, Math.min(CANVAS_H - 10, (e.clientY - containerRect.top) / currentScale))
    );

    const existing = canvasConfigs.find(
      (c) => c.variableName.toLowerCase() === chipName.trim().toLowerCase()
    );
    if (existing) {
      const updated = canvasConfigs.map((c) =>
        c.id === existing.id ? { ...c, x: dropX, y: dropY } : c
      );
      onUpdateConfigsAction(updated);
      onSelectConfigAction(existing.id);
      return;
    }

    const isName = chipName.toLowerCase().includes("name");
    const newConfig: CanvasConfig = {
      id: `cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      variableName: chipName.trim(),
      x: dropX,
      y: dropY,
      fontSize: isName ? 36 : 22,
      fontFamily: "Inter",
      color: isName ? "#111827" : "#374151",
      alignment: "center",
    };

    onUpdateConfigsAction([...canvasConfigs, newConfig]);
    onSelectConfigAction(newConfig.id);
  };

  // Filtered list of sheet columns based on columnSearch query
  const filteredSheetColumns = sheetColumns.filter((col) =>
    col.toLowerCase().includes(columnSearch.trim().toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Sidebar: Dynamic Variables & Excel Sheet Columns Picker */}
      <div className="card border border-white/60 p-5 shadow-sm space-y-4 lg:col-span-1 max-h-[850px] flex flex-col">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-gray-900">
              Dynamic Variables
            </h3>
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
              {sheetColumns.length} Sheet Fields
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Select any field from your uploaded Excel sheet to place on the certificate.
          </p>
        </div>

        {/* Search input when more than 3 sheet columns exist */}
        {sheetColumns.length > 3 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search sheet columns..."
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            {columnSearch && (
              <button
                type="button"
                onClick={() => setColumnSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Scrollable Variables List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* SECTION 1: Excel Sheet Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span>📊</span> Excel / Sheet Columns ({sheetColumns.length})
              </span>
              {sheetColumns.length > 0 && (
                <span className="text-[10px] text-gray-400">Drag or click</span>
              )}
            </div>

            {sheetColumns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400 bg-gray-50/50">
                <p className="font-semibold text-gray-600 mb-1">No sheet uploaded yet</p>
                <p className="text-[11px]">
                  Upload an Excel (.xlsx) or CSV file above to auto-detect all columns.
                </p>
              </div>
            ) : filteredSheetColumns.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2 text-center">
                No sheet columns matching &quot;{columnSearch}&quot;
              </p>
            ) : (
              <div className="space-y-2">
                {filteredSheetColumns.map((colName) => {
                  const meta = getFieldMeta(colName);
                  const placedConfig = canvasConfigs.find(
                    (c) => c.variableName.toLowerCase() === colName.toLowerCase()
                  );

                  return (
                    <div
                      key={colName}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("chipName", colName);
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all duration-200 cursor-grab active:cursor-grabbing ${
                        placedConfig
                          ? "border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs"
                          : "border-gray-200 bg-white text-gray-800 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-900 shadow-sm"
                      }`}
                    >
                      <div
                        className="flex flex-1 items-center gap-2 overflow-hidden mr-1"
                        onClick={() => handleAddChip(colName)}
                        title={`Click to ${placedConfig ? "select" : "place"} {${colName}} on canvas`}
                      >
                        <span className="text-sm flex-shrink-0">{meta.icon}</span>
                        <div className="overflow-hidden">
                          <p className="font-bold truncate text-gray-900">{colName}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">
                            {meta.sample ? `Ex: "${meta.sample}"` : "Dynamic field"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {placedConfig ? (
                          <>
                            <span className="rounded-md bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                              Placed ✓
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveConfig(placedConfig.id);
                              }}
                              className="rounded-md bg-red-100 hover:bg-red-200 p-1 text-[11px] font-bold text-red-700 transition-colors leading-none"
                              title="Remove placeholder from canvas"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddChip(colName)}
                            className="rounded-md bg-gray-100 group-hover:bg-emerald-600 group-hover:text-white px-2 py-1 text-[10px] font-bold transition-colors"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: Standard System Fields */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <span>⚙️</span> System Fields
            </span>
            <div className="space-y-2">
              {SYSTEM_FIELDS.map((chip) => {
                const placedConfig = canvasConfigs.find(
                  (c) => c.variableName.toLowerCase() === chip.name.toLowerCase()
                );

                return (
                  <div
                    key={chip.name}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("chipName", chip.name);
                    }}
                    className={`group flex items-center justify-between rounded-xl border p-2.5 text-xs font-semibold transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      placedConfig
                        ? "border-primary-300 bg-primary-50/70 text-primary-950 shadow-xs"
                        : "border-gray-200 bg-white text-gray-800 hover:border-primary-400 hover:bg-primary-50/40 hover:text-primary-900 shadow-sm"
                    }`}
                  >
                    <div
                      className="flex flex-1 items-center gap-2 overflow-hidden mr-1"
                      onClick={() => handleAddChip(chip.name)}
                    >
                      <span className="text-sm flex-shrink-0">{chip.icon}</span>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate text-gray-900">{chip.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono truncate">
                          {chip.sample}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {placedConfig ? (
                        <>
                          <span className="rounded-md bg-primary-200 px-1.5 py-0.5 text-[9px] font-bold text-primary-800">
                            Placed ✓
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveConfig(placedConfig.id);
                            }}
                            className="rounded-md bg-red-100 hover:bg-red-200 p-1 text-[11px] font-bold text-red-700 transition-colors leading-none"
                            title="Remove placeholder from canvas"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddChip(chip.name)}
                          className="rounded-md bg-gray-100 group-hover:bg-primary-600 group-hover:text-white px-2 py-1 text-[10px] font-bold transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Add Custom Variable / Text Element */}
          <div className="rounded-xl bg-gray-50 p-3 border border-gray-200 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
              <span>✍️</span> Add Custom Variable / Text
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customInputText.trim()) return;
                handleAddChip(customInputText.trim());
                setCustomInputText("");
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="e.g. Dean, Signature, Track..."
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!customInputText.trim()}
                className="rounded-lg bg-primary-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors flex-shrink-0"
              >
                + Add
              </button>
            </form>
            <p className="text-[10px] text-gray-400">
              Adds a new custom element directly onto the certificate canvas.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50/80 p-2.5 text-[11px] text-gray-500 border border-gray-100 flex-shrink-0">
          <p className="font-semibold text-gray-700 mb-0.5">💡 Canvas Studio Tips:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>Click or drag any Excel column to position it on the certificate.</li>
            <li>Click any placed element to format font, alignment, or color.</li>
          </ul>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="card border border-white/60 p-4 shadow-sm lg:col-span-3 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              Interactive Canvas Studio
            </span>
            {isPreviewMode && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                Live Data Preview Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Controls */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("fit")}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  viewMode === "fit"
                    ? "bg-white text-gray-900 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Fit entire certificate to screen without sliding"
              >
                Fit Screen ({Math.round(scale * 100)}%)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("actual")}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  viewMode === "actual"
                    ? "bg-white text-gray-900 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="View at original 1:1 1200x800 resolution"
              >
                100% Size
              </button>
            </div>

            <span className="text-xs text-gray-400 font-mono hidden md:inline">
              1200 × 800 px
            </span>
          </div>
        </div>

        {/* Dynamic Responsive Viewport — zero sliding, fully visible at once */}
        <div
          ref={wrapperRef}
          className="w-full flex-1 min-h-[380px] flex items-center justify-center p-2 sm:p-4 rounded-2xl bg-gray-100/70 border border-gray-200/80 overflow-auto"
        >
          <div
            style={{
              width: `${CANVAS_W * scale}px`,
              height: `${CANVAS_H * scale}px`,
              position: "relative",
            }}
            className="rounded-xl shadow-2xl overflow-hidden flex-shrink-0 transition-all duration-150"
          >
            {/* Fixed-size 1200x800 canvas container, scaled smoothly via CSS transform */}
            <div
              ref={canvasContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => onSelectConfigAction(null)}
              style={{
                width: `${CANVAS_W}px`,
                height: `${CANVAS_H}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="relative bg-white select-none"
            >
              {/* Background Template Image */}
              <img
                src={effectiveImageUrl}
                alt="Certificate Template"
                draggable={false}
                style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px` }}
                className="absolute inset-0 pointer-events-none object-fill"
              />

              {/* Positioned Variable Elements */}
              {canvasConfigs.map((config) => {
                const isSelected = config.id === selectedConfigId;
                const textValue = getDisplayValue(config);
                const align = config.alignment || "center";

                // Translate anchor based on alignment to match canvas ctx.textAlign & textBaseline:
                // - center: horizontal center at x, vertical center at y
                // - left: left edge at x, vertical center at y
                // - right: right edge at x, vertical center at y
                const translateX =
                  align === "center"
                    ? "-50%"
                    : align === "right"
                    ? "-100%"
                    : "0%";

                return (
                  <div
                    key={config.id}
                    onMouseDown={(e) => handleMouseDown(e, config)}
                    style={{
                      left: `${config.x}px`,
                      top: `${config.y}px`,
                      transform: `translate(${translateX}, -50%)`,
                      textAlign: align,
                      fontSize: `${config.fontSize}px`,
                      fontFamily: `${config.fontFamily}, sans-serif`,
                      color: config.color,
                    }}
                    className={`group absolute cursor-move whitespace-nowrap z-20 leading-none select-none transition-shadow ${
                      isSelected
                        ? "ring-2 ring-primary-500 ring-offset-2 bg-primary-50/60 rounded-lg shadow-lg"
                        : "hover:ring-1 hover:ring-gray-400 hover:bg-white/40 rounded-lg"
                    }`}
                  >
                    <span className="font-bold inline-block leading-none py-1 px-1.5">
                      {textValue}
                    </span>

                    {/* Direct ✕ Remove handle button on canvas item */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveConfig(config.id);
                      }}
                      className="absolute -top-2.5 -right-2.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold shadow-md hover:bg-red-700 transition-transform hover:scale-110 z-30"
                      title="Remove placeholder from certificate"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
