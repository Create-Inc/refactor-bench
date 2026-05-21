import { useMemo } from "react";
import {
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import { Zap, AlertTriangle, Shuffle } from "lucide-react";

export function ResourceRow({
  resource,
  days,
  allocations,
  timeBlocks,
  onReassignAllocation,
}) {
  // Calculate weekly load for the visible range with capacity buffer consideration
  const totalWeeklyHours = useMemo(() => {
    return days.reduce((acc, day) => {
      const dayAllocations = allocations.filter((a) => {
        const start = startOfDay(parseISO(a.start_date));
        const end = endOfDay(parseISO(a.end_date));
        return isWithinInterval(day, { start, end });
      });
      return (
        acc +
        dayAllocations.reduce((dacc, a) => dacc + Number(a.hours_per_day), 0)
      );
    }, 0);
  }, [days, allocations]);

  // Calculate time blocked (non-project time)
  const totalBlockedHours = useMemo(() => {
    return days.reduce((acc, day) => {
      const dayBlocks = timeBlocks.filter((tb) => {
        const start = startOfDay(parseISO(tb.start_date));
        const end = endOfDay(parseISO(tb.end_date));
        return isWithinInterval(day, { start, end });
      });
      return (
        acc + dayBlocks.reduce((dacc, tb) => dacc + Number(tb.hours_per_day), 0)
      );
    }, 0);
  }, [days, timeBlocks]);

  // Adjusted for effort multiplier
  const adjustedWeeklyHours =
    totalWeeklyHours * (resource.effort_multiplier || 1.0);

  // Target capacity based on target_utilization (e.g., 0.75 = 75% target)
  const targetCapacity =
    resource.weekly_capacity * (resource.target_utilization || 0.75);
  const actualAvailableCapacity = resource.weekly_capacity - totalBlockedHours;

  // Load percentage against target capacity
  const loadPercentage = Math.min(
    (adjustedWeeklyHours / targetCapacity) * 100,
    100,
  );

  // Available hours after accounting for blocked time and current allocations
  const availableHours = Math.max(
    actualAvailableCapacity - adjustedWeeklyHours,
    0,
  );

  const efficiencyLabel =
    resource.effort_multiplier > 1.0
      ? "Senior"
      : resource.effort_multiplier < 1.0
        ? "Junior"
        : "Standard";

  return (
    <div className="flex border-b border-gray-100 group">
      {/* Sidebar Info */}
      <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 bg-white group-hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {resource.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{resource.name}</div>
            <div className="text-xs text-gray-500">{resource.role}</div>
            {resource.effort_multiplier !== 1.0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Zap size={10} className="text-amber-500" />
                <span className="text-[10px] text-amber-600 font-bold">
                  {efficiencyLabel} ({resource.effort_multiplier}x)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Capacity Indicator */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
            <span>
              Target Load (
              {Math.round((resource.target_utilization || 0.75) * 100)}%)
            </span>
            <span>
              {Math.round(adjustedWeeklyHours)}h / {Math.round(targetCapacity)}h
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                loadPercentage > 90
                  ? "bg-red-500"
                  : loadPercentage > 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-gray-400 pt-1">
            <span>Available: {Math.round(availableHours)}h</span>
            {totalBlockedHours > 0 && (
              <span className="text-orange-600">
                Blocked: {Math.round(totalBlockedHours)}h
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Cells */}
      {days.map((day, idx) => {
        const dayAllocations = allocations.filter((a) => {
          const start = startOfDay(parseISO(a.start_date));
          const end = endOfDay(parseISO(a.end_date));
          return isWithinInterval(day, { start, end });
        });

        const dayBlocks = timeBlocks.filter((tb) => {
          const start = startOfDay(parseISO(tb.start_date));
          const end = endOfDay(parseISO(tb.end_date));
          return isWithinInterval(day, { start, end });
        });

        const totalHours = dayAllocations.reduce(
          (acc, a) => acc + Number(a.hours_per_day),
          0,
        );
        const blockedHours = dayBlocks.reduce(
          (acc, tb) => acc + Number(tb.hours_per_day),
          0,
        );
        const dailyCapacity = resource.weekly_capacity / 5;
        const capacityExceeded = totalHours + blockedHours > dailyCapacity;

        return (
          <div
            key={idx}
            className={`flex-1 min-w-[120px] p-2 border-l border-gray-100 relative min-h-[100px] transition-colors group-hover:bg-gray-50/50 ${isSameDay(day, new Date()) ? "bg-blue-50/30" : ""}`}
          >
            <div className="flex flex-col gap-1">
              {/* Time Blocks (PTO, Training, etc.) */}
              {dayBlocks.map((block, bidx) => (
                <div
                  key={`block-${bidx}`}
                  className="px-2 py-1.5 rounded text-[11px] font-medium bg-gray-200 border-l-4 border-gray-400 text-gray-600"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 8px)",
                  }}
                  title={`${block.block_type}: ${block.description || "Unavailable"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{block.hours_per_day}h</span>
                    <span className="opacity-70 truncate ml-1 text-[10px]">
                      {block.block_type}
                    </span>
                  </div>
                </div>
              ))}

              {/* Project Allocations */}
              {dayAllocations.map((alloc, aidx) => (
                <div
                  key={aidx}
                  className="px-2 py-1.5 rounded text-[11px] font-medium shadow-sm border-l-4 cursor-pointer hover:brightness-95 transition-all group/alloc relative"
                  style={{
                    backgroundColor: `${alloc.project_color}20`,
                    borderColor: alloc.project_color,
                    color: alloc.project_color,
                  }}
                  title={`${alloc.project_name}${alloc.phase_name ? ` - ${alloc.phase_name}` : ""}: ${alloc.hours_per_day}h${alloc.complexity ? ` (${alloc.complexity})` : ""}\nClick to reassign`}
                  onClick={() => onReassignAllocation(alloc)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{alloc.hours_per_day}h</span>
                    <span className="opacity-70 truncate ml-1 text-[10px]">
                      {alloc.phase_name || alloc.project_name}
                    </span>
                  </div>
                  {alloc.complexity && (
                    <div className="text-[9px] mt-0.5 opacity-60">
                      {alloc.complexity === "high"
                        ? "⚠️ Complex"
                        : alloc.complexity === "low"
                          ? "✓ Simple"
                          : "• Medium"}
                    </div>
                  )}
                  <div className="absolute top-0 right-0 opacity-0 group-hover/alloc:opacity-100 transition-opacity">
                    <Shuffle size={10} className="m-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Over-capacity warning */}
            {capacityExceeded && (
              <div
                className="absolute top-1 right-1 text-red-500"
                title="Over capacity!"
              >
                <AlertTriangle size={14} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
