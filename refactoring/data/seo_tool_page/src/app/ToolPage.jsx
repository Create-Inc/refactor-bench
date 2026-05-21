"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  File as FileIcon,
  ChevronRight,
  Shield,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Lock,
  Music,
  Table,
  Presentation,
  FileArchive,
  BookOpen,
  Code,
  Palette,
} from "lucide-react";
import { FileCompressionEngine } from "@/components/FileCompressionEngine";
import {
  generateH1,
  generateIntro,
  generateWhySizeLimitsSection,
  generateStepByStep,
  generateTipsSection,
  generateFAQs,
} from "@/data/seo-content";
import { getRelatedTools } from "@/data/rules";

const iconColors = {
  pdf: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  image: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  jpg: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  png: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  photo: { bg: "#FDF4FF", color: "#9333EA", border: "#E9D5FF" },
  video: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  docx: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  document: { bg: "#F0F9FF", color: "#0284C7", border: "#BAE6FD" },
  mp4: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  // Spreadsheet
  excel: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  xlsx: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  xls: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  csv: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  ods: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  // Presentation
  pptx: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  ppt: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  powerpoint: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  odp: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  // Document extras
  word: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  rtf: { bg: "#F0F9FF", color: "#0284C7", border: "#BAE6FD" },
  txt: { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" },
  odt: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  // Image extras
  gif: { bg: "#FDF4FF", color: "#A855F7", border: "#E9D5FF" },
  svg: { bg: "#FFF7ED", color: "#F97316", border: "#FED7AA" },
  webp: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  tiff: { bg: "#EFF6FF", color: "#3B82F6", border: "#BFDBFE" },
  bmp: { bg: "#F3F4F6", color: "#6B7280", border: "#D1D5DB" },
  heic: { bg: "#FDF4FF", color: "#9333EA", border: "#E9D5FF" },
  // Design
  psd: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "ai-file": { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  eps: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  // Audio
  audio: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  mp3: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  wav: { bg: "#EDE9FE", color: "#6D28D9", border: "#C4B5FD" },
  flac: { bg: "#EDE9FE", color: "#5B21B6", border: "#C4B5FD" },
  aac: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  ogg: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
  // Video extras
  mov: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  avi: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  wmv: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  mkv: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
  webm: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  // Archive
  zip: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  rar: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  "7z": { bg: "#FEF3C7", color: "#78350F", border: "#FDE68A" },
  // Web / Ebook
  html: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  epub: { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
};
const defaultIconColor = { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" };

export default function ToolPage({ tool }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [compressedFile, setCompressedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);

  const h1 = generateH1(tool);
  const intro = generateIntro(tool);
  const whySection = generateWhySizeLimitsSection(tool);
  const steps = generateStepByStep(tool);
  const tips = generateTipsSection(tool);
  const faqs = generateFAQs(tool);
  const relatedTools = getRelatedTools(tool.slug, 8);

  const toolColors = iconColors[tool.fileType] || defaultIconColor;

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setStatus("idle");
    setError(null);
    setCompressedFile(null);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const compressFile = useCallback(async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(0);
    setError(null);
    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      const engine = new FileCompressionEngine(tool.targetKB, tool.fileType);
      const compressed = await engine.compress(file);
      clearInterval(progressInterval);
      setProgress(100);
      setCompressedFile(compressed);
      setCompressedSize(compressed.size);
      setStatus("success");
    } catch (err) {
      console.error("Compression error:", err);
      setError(
        "Failed to compress file. Please try again or use a different file.",
      );
      setStatus("error");
    }
  }, [file, tool.targetKB, tool.fileType]);

  const downloadFile = useCallback(() => {
    if (!compressedFile || typeof document === "undefined") return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [compressedFile, file]);

  const getFileIcon = () => {
    if (
      tool.fileType.includes("pdf") ||
      tool.fileType.includes("doc") ||
      tool.fileType === "word" ||
      tool.fileType === "rtf" ||
      tool.fileType === "odt" ||
      tool.fileType === "txt"
    )
      return FileText;
    if (
      [
        "image",
        "jpg",
        "png",
        "jpeg",
        "photo",
        "gif",
        "svg",
        "webp",
        "tiff",
        "bmp",
        "heic",
      ].includes(tool.fileType)
    )
      return ImageIcon;
    if (
      ["video", "mp4", "mov", "avi", "wmv", "mkv", "webm"].includes(
        tool.fileType,
      )
    )
      return Video;
    if (["excel", "xlsx", "xls", "csv", "ods"].includes(tool.fileType))
      return Table;
    if (["pptx", "ppt", "powerpoint", "odp"].includes(tool.fileType))
      return Presentation;
    if (["audio", "mp3", "wav", "flac", "aac", "ogg"].includes(tool.fileType))
      return Music;
    if (["psd", "ai-file", "eps"].includes(tool.fileType)) return Palette;
    if (["zip", "rar", "7z"].includes(tool.fileType)) return FileArchive;
    if (["epub"].includes(tool.fileType)) return BookOpen;
    if (["html"].includes(tool.fileType)) return Code;
    return FileIcon;
  };

  const Icon = getFileIcon();

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO HEADER ===== */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mb-6 flex-wrap">
            <a href="/" className="hover:text-white transition-colors">
              Home
            </a>
            <span>/</span>
            {tool.platformId && (
              <>
                <a
                  href={`/platform/${tool.platformId}`}
                  className="hover:text-white transition-colors"
                >
                  {tool.platform}
                </a>
                <span>/</span>
              </>
            )}
            <span className="text-white/90">
              {tool.action} {tool.fileTypeLabel}
            </span>
          </nav>

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Icon size={30} className="text-white" />
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4">
            {h1}
          </h1>
          <p className="text-base md:text-lg text-white/75 mb-8 max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div
              className="inline-flex items-center gap-1.5 bg-white/15 text-white rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                WebkitBackdropFilter: "blur(8px)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Target size={12} /> Target: {tool.targetLabel.toUpperCase()}
            </div>
            {tool.platform && (
              <div
                className="inline-flex items-center gap-1.5 bg-white/15 text-white rounded-full px-3.5 py-1.5 text-xs font-medium"
                style={{
                  WebkitBackdropFilter: "blur(8px)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {tool.platform}
              </div>
            )}
            <div
              className="inline-flex items-center gap-1.5 bg-white/15 text-white rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                WebkitBackdropFilter: "blur(8px)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Lock size={12} /> 100% Private
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOOL UI ===== */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 -mt-6 relative z-10 mb-12">
        <div
          className="bg-white rounded-2xl p-6 md:p-8"
          style={{
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all"
            style={{
              borderColor: file ? toolColors.border : "#E5E7EB",
              backgroundColor: file ? toolColors.bg : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!file) {
                e.currentTarget.style.borderColor = toolColors.color;
                e.currentTarget.style.backgroundColor = toolColors.bg;
              }
            }}
            onMouseLeave={(e) => {
              if (!file) {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
              accept={
                ["image", "jpg", "png", "jpeg", "photo"].includes(tool.fileType)
                  ? "image/*"
                  : tool.fileType === "gif"
                    ? "image/gif"
                    : tool.fileType === "svg"
                      ? "image/svg+xml"
                      : tool.fileType === "webp"
                        ? "image/webp"
                        : tool.fileType === "tiff"
                          ? "image/tiff"
                          : tool.fileType === "bmp"
                            ? "image/bmp"
                            : tool.fileType === "heic"
                              ? "image/heic,image/heif"
                              : tool.fileType === "video" ||
                                  tool.fileType === "mp4" ||
                                  tool.fileType === "mov" ||
                                  tool.fileType === "avi" ||
                                  tool.fileType === "wmv" ||
                                  tool.fileType === "mkv" ||
                                  tool.fileType === "webm"
                                ? "video/*"
                                : tool.fileType === "pdf"
                                  ? "application/pdf"
                                  : [
                                        "audio",
                                        "mp3",
                                        "wav",
                                        "flac",
                                        "aac",
                                        "ogg",
                                      ].includes(tool.fileType)
                                    ? "audio/*"
                                    : ["excel", "xlsx", "xls"].includes(
                                          tool.fileType,
                                        )
                                      ? ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                      : ["pptx", "ppt", "powerpoint"].includes(
                                            tool.fileType,
                                          )
                                        ? ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                                        : ["docx", "word"].includes(
                                              tool.fileType,
                                            )
                                          ? ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                                          : ["zip", "rar", "7z"].includes(
                                                tool.fileType,
                                              )
                                            ? ".zip,.rar,.7z"
                                            : tool.fileType === "epub"
                                              ? ".epub"
                                              : tool.fileType === "csv"
                                                ? ".csv,text/csv"
                                                : tool.fileType === "html"
                                                  ? ".html,.htm"
                                                  : tool.fileType === "psd"
                                                    ? ".psd"
                                                    : tool.fileType === "eps"
                                                      ? ".eps"
                                                      : tool.fileType ===
                                                          "ai-file"
                                                        ? ".ai"
                                                        : "*"
              }
            />
            {!file ? (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: toolColors.bg,
                    border: `1px solid ${toolColors.border}`,
                  }}
                >
                  <Upload size={28} style={{ color: toolColors.color }} />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  {tool.formats
                    ? tool.formats.join(", ").toUpperCase()
                    : tool.fileTypeLabel}{" "}
                  files • Target: {tool.targetLabel.toUpperCase()}
                </p>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    backgroundColor: toolColors.bg,
                    border: `1px solid ${toolColors.border}`,
                  }}
                >
                  <Icon size={28} style={{ color: toolColors.color }} />
                </div>
                <p className="text-base font-semibold text-gray-900 mb-1">
                  {file.name}
                </p>
                <p className="text-sm text-gray-500">
                  Current: {formatFileSize(originalSize)} • Target:{" "}
                  {tool.targetLabel.toUpperCase()}
                </p>
              </>
            )}
          </div>

          {file && status === "idle" && (
            <button
              onClick={compressFile}
              className="w-full mt-6 text-white font-semibold py-4 px-4 rounded-xl transition-all text-sm"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {tool.action} to Under {tool.targetLabel.toUpperCase()}
            </button>
          )}

          {status === "processing" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {tool.gerund || "Processing"}...
                </span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                />
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle
                  size={22}
                  className="text-green-600 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    Compression Complete!
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(originalSize)} →{" "}
                    {formatFileSize(compressedSize)} (
                    {Math.round((1 - compressedSize / originalSize) * 100)}%
                    smaller)
                  </p>
                </div>
              </div>
              <button
                onClick={downloadFile}
                className="w-full text-white font-semibold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
                }}
              >
                <Download size={16} /> Download Compressed {tool.fileTypeLabel}
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-bold text-red-900 mb-1">
                  Compression Failed
                </p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== STEP BY STEP ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <div className="bg-[#FAFBFF] rounded-2xl p-6 md:p-10 border border-gray-100">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">
            How to {tool.action} {tool.fileTypeLabel}
            {tool.platform ? ` for ${tool.platform}` : ""}
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.step} className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {step.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== REQUIREMENTS TABLE ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <div
          className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {tool.platform
              ? `${tool.platform} ${tool.fileTypeLabel} Requirements`
              : `${tool.fileTypeLabel} Size Requirements`}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3.5 pr-4 text-gray-500 font-medium">
                    Maximum File Size
                  </td>
                  <td
                    className="py-3.5 font-bold"
                    style={{ color: toolColors.color }}
                  >
                    {tool.targetLabel.toUpperCase()}
                  </td>
                </tr>
                {tool.formats && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3.5 pr-4 text-gray-500 font-medium">
                      Accepted Formats
                    </td>
                    <td className="py-3.5 text-gray-900">
                      {tool.formats.join(", ").toUpperCase()}
                    </td>
                  </tr>
                )}
                {tool.dpi && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3.5 pr-4 text-gray-500 font-medium">
                      Resolution
                    </td>
                    <td className="py-3.5 text-gray-900">{tool.dpi} DPI</td>
                  </tr>
                )}
                {tool.dimensions && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3.5 pr-4 text-gray-500 font-medium">
                      Dimensions
                    </td>
                    <td className="py-3.5 text-gray-900">
                      {tool.dimensions} pixels
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3.5 pr-4 text-gray-500 font-medium">
                    Processing
                  </td>
                  <td className="py-3.5 text-gray-900">
                    100% browser-based (client-side)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {tool.commonErrors && tool.commonErrors.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Common Upload Errors
              </h3>
              <div className="space-y-2">
                {tool.commonErrors.map((errMsg, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <AlertCircle
                      size={14}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <span>&quot;{errMsg}&quot;</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== WHY SIZE LIMITS ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {whySection.heading}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {whySection.content}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {whySection.extra}
        </p>
      </div>

      {/* ===== TIPS ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <div className="bg-[#FAFBFF] border border-gray-100 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Tips to Reduce {tool.fileTypeLabel} File Size
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-sm text-gray-600"
              >
                <CheckCircle
                  size={16}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== KEY FEATURES ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Target size={22} />,
              color: "#E8384F",
              title: "Exact Size Targeting",
              desc: `Compresses to exactly under ${tool.targetLabel.toUpperCase()}. No guessing.`,
            },
            {
              icon: <Shield size={22} />,
              color: "#16A34A",
              title: "Privacy First",
              desc: "Files never leave your device. Zero server uploads. Safe for sensitive documents.",
            },
            {
              icon: <Clock size={22} />,
              color: "#D97706",
              title: "Instant Results",
              desc: "Most files process in under 5 seconds. No waiting, no signup.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-2xl p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${f.color}12`, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
        <div
          className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-1">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 flex-shrink-0 transition-transform"
                      style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-4 pr-8">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== RELATED TOOLS ===== */}
      {relatedTools.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Related Compression Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedTools.map((related) => {
              const colors = iconColors[related.fileType] || defaultIconColor;
              const RelIcon =
                related.fileType.includes("pdf") ||
                related.fileType.includes("doc") ||
                related.fileType === "word" ||
                related.fileType === "rtf" ||
                related.fileType === "odt" ||
                related.fileType === "txt"
                  ? FileText
                  : [
                        "image",
                        "jpg",
                        "png",
                        "jpeg",
                        "photo",
                        "gif",
                        "svg",
                        "webp",
                        "tiff",
                        "bmp",
                        "heic",
                      ].includes(related.fileType)
                    ? ImageIcon
                    : [
                          "video",
                          "mp4",
                          "mov",
                          "avi",
                          "wmv",
                          "mkv",
                          "webm",
                        ].includes(related.fileType)
                      ? Video
                      : ["excel", "xlsx", "xls", "csv", "ods"].includes(
                            related.fileType,
                          )
                        ? Table
                        : ["pptx", "ppt", "powerpoint", "odp"].includes(
                              related.fileType,
                            )
                          ? Presentation
                          : [
                                "audio",
                                "mp3",
                                "wav",
                                "flac",
                                "aac",
                                "ogg",
                              ].includes(related.fileType)
                            ? Music
                            : ["psd", "ai-file", "eps"].includes(
                                  related.fileType,
                                )
                              ? Palette
                              : ["zip", "rar", "7z"].includes(related.fileType)
                                ? FileArchive
                                : ["epub"].includes(related.fileType)
                                  ? BookOpen
                                  : FileIcon;
              return (
                <a
                  key={related.slug}
                  href={`/tool/${related.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-transparent transition-all flex items-center gap-3"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.04)";
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <RelIcon size={18} style={{ color: colors.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#667eea] truncate transition-colors">
                      {related.action} {related.fileTypeLabel}{" "}
                      {related.platform ? `for ${related.platform}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Target: {related.targetLabel.toUpperCase()}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-[#667eea] flex-shrink-0"
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== PLATFORM HUB LINK ===== */}
      {tool.platformId && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 mb-14">
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{
              background:
                "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
              border: "1px solid #667eea30",
            }}
          >
            <h2 className="text-base font-bold text-gray-900 mb-2">
              Need a Different {tool.platform} Tool?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We have tools for every file type and size limit on{" "}
              {tool.platform}.
            </p>
            <a
              href={`/platform/${tool.platformId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#667eea] hover:text-[#5a6fd6]"
            >
              View All {tool.platform} Tools <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* ===== BOTTOM CTA ===== */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-14 md:pb-20">
        <div
          className="text-center rounded-2xl p-8 md:p-12"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Looking for a different tool?
          </h2>
          <p className="text-sm text-white/75 mb-6">
            Browse all {getRelatedTools.length || "1,000"}+ compression tools
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-[#667eea] font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            Browse All Tools <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
