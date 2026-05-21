import React, { useState } from "react";
import { Moon, Dumbbell, Apple, X } from "lucide-react";

export function GoalsModal({ onClose, currentGoals, onSuccess }) {
  const [formData, setFormData] = useState({
    sleep_hours: currentGoals.sleep_hours || 8,
    sleep_quality: currentGoals.sleep_quality || 85,
    workout_frequency: currentGoals.workout_frequency || 5,
    daily_calories: currentGoals.daily_calories || 2500,
    daily_protein: currentGoals.daily_protein || 180,
    daily_carbs: currentGoals.daily_carbs || 250,
    daily_fats: currentGoals.daily_fats || 70,
    daily_water: currentGoals.daily_water || 3000,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const promises = Object.entries(formData).map(
        ([goal_type, target_value]) =>
          fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              goal_type,
              target_value: parseInt(target_value),
            }),
          }),
      );
      await Promise.all(promises);
      onSuccess();
    } catch (error) {
      console.error("Error saving goals:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Set Your Health Goals</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Moon size={16} /> Sleep Goals
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Daily Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, sleep_hours: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Quality Score (0-100)
                </label>
                <input
                  type="number"
                  value={formData.sleep_quality}
                  onChange={(e) =>
                    setFormData({ ...formData, sleep_quality: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Dumbbell size={16} /> Activity Goals
            </h4>
            <div>
              <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                Weekly Workouts
              </label>
              <input
                type="number"
                value={formData.workout_frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workout_frequency: e.target.value,
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Apple size={16} /> Nutrition Goals
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Daily Calories
                </label>
                <input
                  type="number"
                  value={formData.daily_calories}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_calories: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={formData.daily_protein}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_protein: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={formData.daily_carbs}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_carbs: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Fats (g)
                </label>
                <input
                  type="number"
                  value={formData.daily_fats}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_fats: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1 uppercase tracking-wide">
                  Daily Water (ml)
                </label>
                <input
                  type="number"
                  value={formData.daily_water}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_water: e.target.value })
                  }
                  className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Saving..." : "Save Goals"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#E5E7EB] py-2 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
