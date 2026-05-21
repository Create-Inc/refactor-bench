import { useState } from "react";
import { Lock, MessageCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/utils/translations";

export function SendXrpCard({ onSendXrp, loading, isFrozen }) {
  const { t } = useTranslation();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAccessCode, setRecipientAccessCode] = useState("");
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [frozenMessage, setFrozenMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setError("");
    setFrozenMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/p2p-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          recipientAccessCode,
          amount: parseFloat(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.frozen || data.autoFrozen) {
          setFrozenMessage(data.reason || data.error);
          setError("");
          if (data.autoFrozen) {
            // Reload page after short delay to show frozen state
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        } else {
          setError(data.error || "Transfer failed");
        }
        return;
      }

      // Success - reset form
      setRecipientEmail("");
      setRecipientAccessCode("");
      setAmount("");
      setShowForm(false);
      if (onSendXrp) {
        onSendXrp(recipientEmail, recipientAccessCode, amount);
      }
    } catch (err) {
      console.error("P2P transfer error:", err);
      setError("Failed to process transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFrozen) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] p-6 shadow-xl border border-red-500/50 opacity-60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-6 w-6 text-red-400" />
              {t("send.title")}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{t("send.subtitle")}</p>
          </div>
        </div>
        <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-4 text-center">
          <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-200 font-medium">
            {t("send.suspended")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#334155] p-6 shadow-xl border border-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("send.title")}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t("send.subtitle")}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600"
          >
            {t("send.submit")}
          </button>
        )}
      </div>

      {frozenMessage && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/50 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="rounded-full bg-orange-500/20 p-2">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-400 mb-2">
                {t("withdraw.securityReview")}
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                {frozenMessage}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mb-3">
            Page will refresh automatically...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              {t("send.recipientEmail")}
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              {t("send.recipientAccessCode")}
            </label>
            <input
              type="text"
              value={recipientAccessCode}
              onChange={(e) => setRecipientAccessCode(e.target.value)}
              placeholder="Enter their access code"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              {t("send.amount")}
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-base font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {loading || isSubmitting
                ? t("send.processing")
                : t("send.submit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRecipientEmail("");
                setRecipientAccessCode("");
                setAmount("");
              }}
              className="flex-1 rounded-lg bg-white/10 px-4 py-3 text-base font-semibold text-white transition-all hover:bg-white/20"
            >
              {t("send.cancel")}
            </button>
          </div>

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
            <div className="flex gap-2">
              <svg
                className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">{t("send.howItWorks")}</p>
                <ul className="space-y-1 text-xs">
                  <li>• {t("send.step1")}</li>
                  <li>• {t("send.step2")}</li>
                  <li>• {t("send.step3")}</li>
                  <li>• {t("send.step4")}</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-4">
          <p className="text-sm text-purple-300">💜 {t("send.info")}</p>
        </div>
      )}
    </div>
  );
}
