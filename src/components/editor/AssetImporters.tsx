"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PRESET_TEMPLATES, type PresetTemplate } from "@/utils/defaultTemplates";
import type { CsvRow } from "@/types";

interface AssetImportersProps {
  currentImageUrl: string;
  csvRows: CsvRow[];
  onImageLoadedAction: (dataUrl: string) => void;
  onDataParsedAction: (rows: CsvRow[]) => void;
}

export default function AssetImporters({
  currentImageUrl,
  csvRows,
  onImageLoadedAction,
  onDataParsedAction,
}: AssetImportersProps) {
  const [imageFileName, setImageFileName] = useState("");
  const [dataFileName, setDataFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [showRoleEditor, setShowRoleEditor] = useState(false);

  // Handle image upload (PNG/JPG)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setParseError("Please select a valid image file (PNG, JPG, or SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageFileName(file.name);
        onImageLoadedAction(result);
        setParseError("");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Template Selection
  const handlePresetSelect = (preset: PresetTemplate) => {
    setImageFileName(preset.name);
    onImageLoadedAction(preset.dataUrl);
    setParseError("");
  };

  // Handle CSV / Excel upload
  const handleDataFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDataFileName(file.name);
    setParseError("");

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (fileExt === "csv") {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            onDataParsedAction(results.data);
          } else {
            setParseError("The uploaded CSV file contains no valid rows.");
          }
        },
        error: (err) => {
          setParseError(`Error parsing CSV file: ${err.message}`);
        },
      });
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result;
          const workbook = XLSX.read(buffer, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<CsvRow>(worksheet, {
            defval: "",
          });

          if (jsonData.length > 0) {
            onDataParsedAction(jsonData);
          } else {
            setParseError("The uploaded Excel file contains no valid rows.");
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          setParseError(`Error parsing Excel file: ${message}`);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setParseError("Unsupported file format. Please upload a .csv, .xlsx, or .xls file.");
    }
  };

  // Participant Role editing handlers
  const handleRoleChange = (index: number, newRole: string) => {
    const updated = [...csvRows];
    updated[index] = {
      ...updated[index],
      role: newRole,
      Role: newRole,
    };
    onDataParsedAction(updated);
  };

  const handleRemoveParticipant = (index: number) => {
    const updated = csvRows.filter((_, i) => i !== index);
    onDataParsedAction(updated);
  };

  const handleAddParticipant = () => {
    const newParticipant: CsvRow = {
      name: "New Participant",
      email: "new@example.com",
      role: "Participant",
      issueDate: new Date().toISOString().split("T")[0],
    };
    onDataParsedAction([...csvRows, newParticipant]);
  };

  return (
    <div className="space-y-6">
      {parseError && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 animate-fade-in">
          {parseError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dropzone 1: Certificate Template Image */}
        <div className="card border border-white/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-gray-900">
                1. Certificate Template Importer
              </h3>
              <p className="text-xs text-gray-500">
                Upload custom background image (PNG/JPG) or pick a preset.
              </p>
            </div>
            {currentImageUrl && (
              <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                ✓ Template Loaded
              </span>
            )}
          </div>

          {/* File Upload Box */}
          <label
            htmlFor="template-file-input"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition-all duration-200 hover:border-primary-500 hover:bg-primary-50/20 cursor-pointer"
          >
            <svg
              className="h-8 w-8 text-gray-400 group-hover:text-primary-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="mt-2 text-xs font-semibold text-gray-700 group-hover:text-primary-700">
              {imageFileName ? imageFileName : "Click or drag PNG / JPG image here"}
            </span>
            <span className="mt-1 text-[11px] text-gray-400">
              High resolution landscape images recommended (1200x800 px)
            </span>
            <input
              id="template-file-input"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg+xml"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Quick Preset Selector */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Or Choose Built-in Template Preset:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-left text-xs font-medium text-gray-700 hover:border-primary-400 hover:bg-primary-50/50 hover:text-primary-700 transition-all shadow-sm"
                >
                  <p className="font-bold truncate">{preset.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{preset.category}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dropzone 2: Participant List (CSV / Excel) */}
        <div className="card border border-white/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-gray-900">
                2. Participant List Importer &amp; Role Manager
              </h3>
              <p className="text-xs text-gray-500">
                Upload CSV/Excel file or edit participant roles directly below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleEditor(!showRoleEditor)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-800 hover:bg-primary-200 transition-colors"
            >
              {csvRows.length} Participants {showRoleEditor ? "▲ Hide Table" : "✏️ Edit Roles"}
            </button>
          </div>

          {/* File Upload Box */}
          <label
            htmlFor="data-file-input"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center transition-all duration-200 hover:border-ocean-500 hover:bg-ocean-50/20 cursor-pointer"
          >
            <svg
              className="h-8 w-8 text-gray-400 group-hover:text-ocean-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="mt-2 text-xs font-semibold text-gray-700 group-hover:text-ocean-700">
              {dataFileName ? dataFileName : "Click or drag .CSV, .XLSX, or .XLS file here"}
            </span>
            <span className="mt-1 text-[11px] text-gray-400">
              Supported columns: [Name, Email, Role, IssueDate]
            </span>
            <input
              id="data-file-input"
              type="file"
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleDataFileUpload}
              className="hidden"
            />
          </label>

          {/* Column Format Info & Detected Columns */}
          <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-semibold text-gray-700">
                {csvRows.length > 0
                  ? `Detected Sheet Columns (${Object.keys(csvRows[0] || {}).length}):`
                  : "Recommended Sheet Headers:"}
              </span>
              <div className="flex flex-wrap gap-1">
                {(csvRows.length > 0
                  ? Object.keys(csvRows[0] || {})
                  : ["Name", "Email", "Role", "IssueDate", "+ Any Custom Column"]
                ).map((col) => (
                  <span
                    key={col}
                    className="rounded bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-primary-700 border border-primary-200 shadow-2xs"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
            {csvRows.length > 0 && (
              <p className="text-[11px] text-emerald-700 font-medium">
                ✓ All sheet columns above can be selected and placed onto the certificate in the Dynamic Variables studio below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Admin Participant Role Editor Table */}
      {showRoleEditor && (
        <div className="card border border-white/60 p-5 shadow-lg space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display text-sm font-bold text-gray-900">
                Admin Participant &amp; Role Manager
              </h4>
              <p className="text-xs text-gray-500">
                Customize or override the <span className="font-semibold text-gray-800">Role</span> for individual participants.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddParticipant}
              className="btn-primary text-xs px-3 py-1.5"
            >
              + Add Participant
            </button>
          </div>

          <div className="overflow-x-auto max-h-60 rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 sticky top-0 border-b border-gray-200 text-gray-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Participant Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role (Editable)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {csvRows.map((row, index) => {
                  const currentRole = row.role || row.Role || "Participant";
                  const pName = row.name || row.Name || "Participant";
                  const pEmail = row.email || row.Email || "";

                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-mono text-gray-400">{index + 1}</td>
                      <td className="p-3 font-semibold text-gray-900">{pName}</td>
                      <td className="p-3 text-gray-500">{pEmail}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={currentRole}
                          onChange={(e) => handleRoleChange(index, e.target.value)}
                          placeholder="e.g. Winner, Speaker, Participant"
                          className="w-full max-w-[180px] rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-900 font-medium outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(index)}
                          className="rounded-lg p-1 text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove participant"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {csvRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      No participants loaded yet. Upload a file or click + Add Participant above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
