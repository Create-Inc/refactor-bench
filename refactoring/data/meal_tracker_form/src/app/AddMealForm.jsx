import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useFoodSearch } from "@/hooks/useFoodSearch";

export function AddMealForm({ onSubmit, onCancel, tier, loading }) {
  const [isManualMode, setIsManualMode] = useState(false);
  const dropdownRef = useRef(null);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    showDropdown,
    setShowDropdown,
    handleSearchChange,
    clearSearch,
  } = useFoodSearch();

  const [newMeal, setNewMeal] = useState({
    meal_type: "breakfast",
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectFoodItem = (item) => {
    setNewMeal({
      ...newMeal,
      food_name: item.name,
      calories: item.calories.toString(),
      protein: item.protein.toString(),
      carbs: item.carbs.toString(),
      fat: item.fat.toString(),
    });
    setSearchQuery(item.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSubmit(newMeal);
    if (success) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNewMeal({
      meal_type: "breakfast",
      food_name: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    });
    clearSearch();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-[#FFFAF0] rounded-lg border border-[#F0E6D8]"
    >
      <select
        value={newMeal.meal_type}
        onChange={(e) => setNewMeal({ ...newMeal, meal_type: e.target.value })}
        className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => {
            setIsManualMode(false);
            setShowDropdown(false);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            !isManualMode
              ? "bg-[#2D5A4A] text-white"
              : "bg-white border border-[#E8DCC8] text-[#9B8B7E] hover:bg-[#FFFAF0]"
          }`}
        >
          <Search size={14} className="inline mr-1" />
          AI Search
        </button>
        <button
          type="button"
          onClick={() => {
            setIsManualMode(true);
            setShowDropdown(false);
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
            isManualMode
              ? "bg-[#2D5A4A] text-white"
              : "bg-white border border-[#E8DCC8] text-[#9B8B7E] hover:bg-[#FFFAF0]"
          }`}
        >
          Manual Entry
        </button>
      </div>

      {/* AI Search Mode */}
      {!isManualMode ? (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]"
            />
            <input
              required
              placeholder="Search food (e.g., grapes, chicken breast...)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
            />
          </div>

          {/* Dropdown Results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-[#E8DCC8] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectFoodItem(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#FFFAF0] border-b border-[#F0E6D8] last:border-b-0 transition-colors"
                >
                  <div className="text-sm font-medium text-[#1B4D3E]">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#9B8B7E] mt-0.5">
                    {item.calories} cal • P: {item.protein}g C: {item.carbs}g F:{" "}
                    {item.fat}g
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchLoading && (
            <div className="text-xs text-[#9B8B7E] mb-2">Searching...</div>
          )}

          {/* Show selected item details */}
          {newMeal.food_name && (
            <div className="bg-[#F0F9F7] border border-[#C8E6E0] rounded-lg p-3 mb-2">
              <div className="text-sm font-medium text-[#1B4D3E] mb-1">
                {newMeal.food_name}
              </div>
              <div className="text-xs text-[#9B8B7E]">
                {newMeal.calories} cal
                {tier !== "free" &&
                  newMeal.protein &&
                  ` • P: ${newMeal.protein}g C: ${newMeal.carbs}g F: ${newMeal.fat}g`}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Manual Entry Mode */
        <>
          <input
            required
            placeholder="Food name"
            value={newMeal.food_name}
            onChange={(e) =>
              setNewMeal({
                ...newMeal,
                food_name: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
          />
          <input
            required
            type="number"
            placeholder="Calories"
            value={newMeal.calories}
            onChange={(e) =>
              setNewMeal({ ...newMeal, calories: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
          />
          {tier !== "free" && (
            <>
              <input
                type="number"
                step="0.1"
                placeholder="Protein (g)"
                value={newMeal.protein}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    protein: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Carbs (g)"
                value={newMeal.carbs}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    carbs: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Fat (g)"
                value={newMeal.fat}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, fat: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A4A] focus-visible:ring-offset-2"
              />
            </>
          )}
        </>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !newMeal.food_name || !newMeal.calories}
          className="flex-1 bg-[#2D5A4A] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#1B4D3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-3 py-2 border border-[#E8DCC8] rounded-lg text-sm hover:bg-[#FFFAF0] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
