import {
  Check,
  Wand2,
  Bell,
  BellOff,
  Palette,
  Type,
  Trash,
  Sparkles,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export function NoteEditorEnhanced({
  note,
  onNoteChange,
  onCategoryChange,
  saveIndicator,
  wordCount,
  charCount,
}) {
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#d4a853");
  const [drawingSize, setDrawingSize] = useState(3);
  const [autoIndent, setAutoIndent] = useState(false);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const editorRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const allCategories = Array.from(new Set([...categories, "General"])).sort();

  // Load auto-indent setting
  useEffect(() => {
    const saved = localStorage.getItem("notepad-auto-indent") === "true";
    setAutoIndent(saved);

    const handleAutoIndentChange = (e) => {
      setAutoIndent(e.detail);
    };

    window.addEventListener("autoIndentChange", handleAutoIndentChange);
    return () =>
      window.removeEventListener("autoIndentChange", handleAutoIndentChange);
  }, []);

  // Update mutation for additional fields
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // Get AI Suggestion
  const getAiSuggestion = async () => {
    if (!note?.body || note.body.trim().length < 10) {
      setAiSuggestion("");
      return;
    }

    setIsLoadingSuggestion(true);
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: note.body,
          title: note.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.suggestion || "");
      }
    } catch (error) {
      console.error("Failed to get AI suggestion:", error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Accept AI Suggestion
  const acceptSuggestion = () => {
    if (!note || !aiSuggestion) return;

    const newBody = note.body + " " + aiSuggestion;
    updateMutation.mutate({ id: note.id, body: newBody });
    setAiSuggestion("");

    if (editorRef.current) {
      editorRef.current.value = newBody;
    }
  };

  // Set reminder
  const handleSetReminder = () => {
    if (!note || !reminderDate || !reminderTime) return;

    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    updateMutation.mutate({
      id: note.id,
      reminder_at: reminderDateTime.toISOString(),
    });

    setShowReminderModal(false);
    setReminderDate("");
    setReminderTime("");
  };

  const handleClearReminder = () => {
    if (!note) return;
    updateMutation.mutate({ id: note.id, reminder_at: null });
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    isDrawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = drawingSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (canvasRef.current && note) {
      const dataUrl = canvasRef.current.toDataURL();
      updateMutation.mutate({
        id: note.id,
        has_drawing: true,
        drawing_data: dataUrl,
      });
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (note) {
      updateMutation.mutate({
        id: note.id,
        has_drawing: false,
        drawing_data: null,
      });
    }
  };

  // Load drawing when switching notes
  useEffect(() => {
    if (isDrawingMode && canvasRef.current && note?.drawing_data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = note.drawing_data;
    } else if (isDrawingMode && canvasRef.current && !note?.drawing_data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [isDrawingMode, note?.id, note?.drawing_data]);

  // Handle Tab key for auto-indent
  const handleKeyDown = (e) => {
    if (e.key === "Tab" && autoIndent) {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      textarea.value =
        value.substring(0, start) + "    " + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;

      onNoteChange({ target: textarea }, "body");
    }

    // Cmd/Ctrl + K for AI suggestion
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      getAiSuggestion();
    }
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <div className="editor-content flex-1 flex flex-col">
        <div className="px-8 py-4 border-b border-[var(--border)] flex items-center gap-4 shrink-0 flex-wrap">
          <input
            type="text"
            placeholder="Untitled"
            defaultValue={note?.title}
            key={`title-${note?.id}`}
            onChange={(e) => onNoteChange(e, "title")}
            className="flex-1 min-w-[200px] bg-transparent border-none text-[var(--text)] font-playfair-display text-2xl font-bold outline-none placeholder:text-[var(--muted)]"
          />
          <div className="flex items-center gap-3 flex-wrap">
            {/* Drawing mode toggle */}
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`p-2 rounded-lg border transition-colors ${
                isDrawingMode
                  ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface)]"
              }`}
              title="Toggle drawing mode"
            >
              {isDrawingMode ? <Type size={16} /> : <Palette size={16} />}
            </button>

            {/* Reminder button */}
            <button
              onClick={() => setShowReminderModal(true)}
              className={`p-2 rounded-lg border transition-colors ${
                note?.reminder_at
                  ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface)]"
              }`}
              title={note?.reminder_at ? "Edit reminder" : "Set reminder"}
            >
              {note?.reminder_at ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* AI Suggestion button */}
            <button
              onClick={getAiSuggestion}
              disabled={isLoadingSuggestion}
              className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
              title="Get AI suggestion (Cmd/Ctrl+K)"
            >
              {isLoadingSuggestion ? (
                <div className="animate-spin">
                  <Sparkles size={16} />
                </div>
              ) : (
                <Wand2 size={16} />
              )}
            </button>

            <select
              value={note?.category || "General"}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-[10px] uppercase tracking-wider rounded-lg outline-none cursor-pointer hover:bg-[var(--surface)] transition-colors"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div
              className={`flex items-center gap-1.5 text-[10px] text-[var(--muted)] uppercase tracking-wider transition-opacity duration-300 ${saveIndicator ? "opacity-100" : "opacity-0"}`}
            >
              <Check size={12} className="text-[var(--accent)]" />
              saved
            </div>
          </div>
        </div>

        {/* AI Suggestion Bar */}
        {aiSuggestion && !isDrawingMode && (
          <div className="px-8 py-3 bg-[var(--surface)] border-b border-[var(--border)] flex items-center gap-3">
            <Sparkles size={14} className="text-[var(--accent)] shrink-0" />
            <div className="flex-1 text-[12px] text-[var(--muted)] italic">
              {aiSuggestion}
            </div>
            <button
              onClick={acceptSuggestion}
              className="px-3 py-1 bg-[var(--accent)] text-[var(--bg)] text-[10px] uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
            >
              Accept
            </button>
            <button
              onClick={() => setAiSuggestion("")}
              className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {isDrawingMode ? (
          <div className="flex-1 flex flex-col p-8 gap-4 overflow-auto">
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)] flex-wrap">
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                Drawing Tools
              </div>
              <input
                type="color"
                value={drawingColor}
                onChange={(e) => setDrawingColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <input
                type="range"
                min="1"
                max="20"
                value={drawingSize}
                onChange={(e) => setDrawingSize(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-[10px] text-[var(--muted)]">
                {drawingSize}px
              </span>
              <button
                onClick={clearCanvas}
                className="ml-auto px-3 py-1.5 bg-[var(--danger)] text-white text-[10px] uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Trash size={12} />
                Clear
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border border-[var(--border)] rounded-lg bg-white cursor-crosshair"
              style={{ maxWidth: "100%", maxHeight: "calc(100vh - 400px)" }}
            />
          </div>
        ) : (
          <textarea
            ref={editorRef}
            placeholder="Start writing..."
            defaultValue={note?.body}
            key={`body-${note?.id}`}
            onChange={(e) => onNoteChange(e, "body")}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-[var(--text)] p-8 resize-none outline-none text-[15px] leading-[1.9] placeholder:text-[var(--muted)] custom-scrollbar"
          />
        )}

        <div className="px-8 py-3 border-t border-[var(--border)] text-[10px] text-[var(--muted)] uppercase tracking-widest flex flex-wrap gap-x-6 gap-y-2 shrink-0">
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span>{charCount} chars</span>
          {note?.reminder_at && (
            <span className="text-[var(--accent)]">
              ⏰ {format(new Date(note.reminder_at), "MMM d, h:mm a")}
            </span>
          )}
          {note && (
            <span className="ml-auto opacity-70">
              edited {format(new Date(note.updated_at), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div
          onClick={() => setShowReminderModal(false)}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[2000] p-5"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-8 max-w-md w-full"
          >
            <h3 className="font-playfair-display text-xl text-[var(--accent)] mb-6">
              Set Reminder
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg outline-none focus:border-[var(--accent-dim)]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg outline-none focus:border-[var(--accent-dim)]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSetReminder}
                  disabled={!reminderDate || !reminderTime}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] text-[var(--bg)] text-[11px] uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Set Reminder
                </button>
                {note?.reminder_at && (
                  <button
                    onClick={() => {
                      handleClearReminder();
                      setShowReminderModal(false);
                    }}
                    className="px-4 py-2 bg-[var(--danger)] text-white text-[11px] uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
