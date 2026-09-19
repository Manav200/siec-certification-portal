"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/store/useEventStore";
import type { CanvasConfig, CsvRow } from "@/types";

import EditorToolbar from "@/components/editor/EditorToolbar";
import AssetImporters from "@/components/editor/AssetImporters";
import TextFormattingBar from "@/components/editor/TextFormattingBar";
import InteractiveCanvas from "@/components/editor/InteractiveCanvas";

export default function CanvasEditorPage() {
  const router = useRouter();
  const { state, dispatch } = useEventStore();
  const { events, activeEventId } = state;

  const activeEvent =
    events.find((e) => e.id === activeEventId) || events[0];

  const [imageUrl, setImageUrl] = useState<string>("");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [canvasConfigs, setCanvasConfigs] = useState<CanvasConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);

  // Sync state with active event on mount / context switch
  useEffect(() => {
    if (activeEvent) {
      setImageUrl(activeEvent.baseImageUrl || "");
      setCsvRows(activeEvent.csvData || []);
      setCanvasConfigs(
        activeEvent.canvasConfigs && activeEvent.canvasConfigs.length > 0
          ? activeEvent.canvasConfigs
          : [
              {
                id: "cfg-default-1",
                variableName: "Participant Name",
                x: 600,
                y: 280,
                fontSize: 36,
                fontFamily: "Inter",
                color: "#111827",
                alignment: "center",
              },
              {
                id: "cfg-default-2",
                variableName: "Event Name",
                x: 600,
                y: 360,
                fontSize: 22,
                fontFamily: "Inter",
                color: "#4b5563",
                alignment: "center",
              },
            ]
      );
    }
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-gray-500">No active event selected.</p>
        <button
          onClick={() => router.push("/admin")}
          className="btn-primary mt-4"
        >
          Return to Admin Dashboard
        </button>
      </div>
    );
  }

  // Importer Handlers
  const handleImageLoaded = (dataUrl: string) => {
    setImageUrl(dataUrl);
    dispatch({
      type: "UPDATE_EVENT",
      payload: { ...activeEvent, baseImageUrl: dataUrl },
    });
  };

  const handleDataParsed = (rows: CsvRow[]) => {
    setCsvRows(rows);
    dispatch({
      type: "UPDATE_EVENT",
      payload: { ...activeEvent, csvData: rows },
    });
  };

  // Text Formatting Bar Handlers
  const handleUpdateConfig = (updated: CanvasConfig) => {
    setCanvasConfigs((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteConfig = (id: string) => {
    setCanvasConfigs((prev) => prev.filter((c) => c.id !== id));
    if (selectedConfigId === id) setSelectedConfigId(null);
  };

  const selectedConfig =
    canvasConfigs.find((c) => c.id === selectedConfigId) || null;

  // Save & Publish Campaign Handler
  const handleSaveAndPublish = () => {
    const updatedEvent = {
      ...activeEvent,
      baseImageUrl: imageUrl,
      csvData: csvRows.length > 0 ? csvRows : activeEvent.csvData,
      canvasConfigs: canvasConfigs,
      status: "Published" as const,
    };

    dispatch({ type: "UPDATE_EVENT", payload: updatedEvent });
    setPublishSuccess(true);

    setTimeout(() => {
      router.push("/admin");
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification on Publish */}
      {publishSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-bounce rounded-2xl bg-gradient-primary p-4 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-bold text-sm">Campaign Published Successfully!</p>
              <p className="text-xs text-white/80">
                Redirecting to Admin Workspace...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <EditorToolbar
        event={activeEvent}
        isPreviewMode={isPreviewMode}
        onTogglePreviewAction={() => setIsPreviewMode(!isPreviewMode)}
        onSaveAndPublishAction={handleSaveAndPublish}
      />

      {/* 1. Asset Importers (Image Template & CSV/Excel Dropzones) */}
      <AssetImporters
        currentImageUrl={imageUrl}
        csvRows={csvRows}
        onImageLoadedAction={handleImageLoaded}
        onDataParsedAction={handleDataParsed}
      />

      {/* 2. Active Text Formatting Toolbar */}
      <TextFormattingBar
        selectedConfig={selectedConfig}
        onUpdateConfigAction={handleUpdateConfig}
        onDeleteConfigAction={handleDeleteConfig}
      />

      {/* 3. Interactive Canvas & Draggable Chips Sidebar */}
      <InteractiveCanvas
        event={{ ...activeEvent, baseImageUrl: imageUrl, csvData: csvRows }}
        canvasConfigs={canvasConfigs}
        selectedConfigId={selectedConfigId}
        isPreviewMode={isPreviewMode}
        onSelectConfigAction={(id) => setSelectedConfigId(id)}
        onUpdateConfigsAction={(configs) => setCanvasConfigs(configs)}
      />
    </div>
  );
}
