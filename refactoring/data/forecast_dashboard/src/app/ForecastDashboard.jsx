import React, { useMemo } from "react";
import {
  addWeeks,
  addMonths,
  eachDayOfInterval,
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";

export default function ForecastDashboard({
  resources,
  allocations,
  timeBlocks,
}) {
  // Calculate capacity for a given time period
  const getCapacityForPeriod = (startDate, endDate, label) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const resourceCapacity = resources.map((resource) => {
      const totalAllocatedHours = days.reduce((acc, day) => {
        const dayAllocations = allocations.filter((a) => {
          if (a.resource_id !== resource.id) return false;
          const start = startOfDay(parseISO(a.start_date));
          const end = endOfDay(parseISO(a.end_date));
          return isWithinInterval(day, { start, end });
        });
        return (
          acc +
          dayAllocations.reduce((dacc, a) => dacc + Number(a.hours_per_day), 0)
        );
      }, 0);

      const totalBlockedHours = days.reduce((acc, day) => {
        const dayBlocks = timeBlocks.filter((tb) => {
          if (tb.resource_id !== resource.id) return false;
          const start = startOfDay(parseISO(tb.start_date));
          const end = endOfDay(parseISO(tb.end_date));
          return isWithinInterval(day, { start, end });
        });
        return (
          acc +
          dayBlocks.reduce((dacc, tb) => dacc + Number(tb.hours_per_day), 0)
        );
      }, 0);

      const adjustedHours =
        totalAllocatedHours * (resource.effort_multiplier || 1.0);
      const totalCapacity = resource.weekly_capacity * (days.length / 7);
      const targetCapacity =
        totalCapacity * (resource.target_utilization || 0.75);
      const availableCapacity = totalCapacity - totalBlockedHours;
      const utilizationPercent =
        targetCapacity > 0 ? (adjustedHours / targetCapacity) * 100 : 0;

      return {
        resource,
        allocatedHours: totalAllocatedHours,
        adjustedHours,
        blockedHours: totalBlockedHours,
        targetCapacity,
        availableCapacity,
        remainingCapacity: Math.max(targetCapacity - adjustedHours, 0),
        utilizationPercent,
        isOverloaded: utilizationPercent > 90,
      };
    });

    const teamTotals = {
      totalAllocated: resourceCapacity.reduce(
        (acc, rc) => acc + rc.adjustedHours,
        0,
      ),
      totalTarget: resourceCapacity.reduce(
        (acc, rc) => acc + rc.targetCapacity,
        0,
      ),
      totalRemaining: resourceCapacity.reduce(
        (acc, rc) => acc + rc.remainingCapacity,
        0,
      ),
      totalBlocked: resourceCapacity.reduce(
        (acc, rc) => acc + rc.blockedHours,
        0,
      ),
      overloadedCount: resourceCapacity.filter((rc) => rc.isOverloaded).length,
    };

    return {
      label,
      startDate,
      endDate,
      resourceCapacity,
      teamTotals,
    };
  };

  const now = new Date();
  const twoWeeksStart = startOfWeek(addWeeks(now, 2), { weekStartsOn: 1 });
  const twoWeeksEnd = endOfWeek(addWeeks(now, 2), { weekStartsOn: 1 });

  const oneMonthStart = startOfWeek(addMonths(now, 1), { weekStartsOn: 1 });
  const oneMonthEnd = endOfWeek(addMonths(now, 1), { weekStartsOn: 1 });

  const threeMonthsStart = startOfWeek(addMonths(now, 3), { weekStartsOn: 1 });
  const threeMonthsEnd = endOfWeek(addMonths(now, 3), { weekStartsOn: 1 });

  const twoWeeksForecast = useMemo(
    () => getCapacityForPeriod(twoWeeksStart, twoWeeksEnd, "In 2 Weeks"),
    [resources, allocations, timeBlocks, twoWeeksStart, twoWeeksEnd],
  );

  const oneMonthForecast = useMemo(
    () => getCapacityForPeriod(oneMonthStart, oneMonthEnd, "In 1 Month"),
    [resources, allocations, timeBlocks, oneMonthStart, oneMonthEnd],
  );

  const threeMonthsForecast = useMemo(
    () => getCapacityForPeriod(threeMonthsStart, threeMonthsEnd, "In 3 Months"),
    [resources, allocations, timeBlocks, threeMonthsStart, threeMonthsEnd],
  );

  const forecasts = [twoWeeksForecast, oneMonthForecast, threeMonthsForecast];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">
              Capacity Forecast
            </h2>
          </div>
          <p className="text-gray-500 text-sm">
            View projected team capacity and availability for upcoming periods
          </p>
        </div>

        {/* Forecast Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {forecasts.map((forecast, idx) => {
            const utilizationPercent =
              forecast.teamTotals.totalTarget > 0
                ? (forecast.teamTotals.totalAllocated /
                    forecast.teamTotals.totalTarget) *
                  100
                : 0;

            return (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={18} />
                    <h3 className="font-bold text-lg">{forecast.label}</h3>
                  </div>
                  <p className="text-sm text-blue-100">
                    {format(forecast.startDate, "MMM d")} -{" "}
                    {format(forecast.endDate, "MMM d, yyyy")}
                  </p>
                </div>

                {/* Team Summary */}
                <div className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                        Allocated
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(forecast.teamTotals.totalAllocated)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-medium mb-1">
                        Available
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(forecast.teamTotals.totalRemaining)}h
                      </div>
                    </div>
                  </div>

                  {/* Overall utilization */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Team Utilization</span>
                      <span
                        className={`font-bold ${
                          utilizationPercent > 90
                            ? "text-red-600"
                            : utilizationPercent > 70
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {Math.round(utilizationPercent)}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          utilizationPercent > 90
                            ? "bg-red-500"
                            : utilizationPercent > 70
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(utilizationPercent, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Warnings */}
                  {forecast.teamTotals.overloadedCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                      <AlertTriangle size={14} />
                      {forecast.teamTotals.overloadedCount}{" "}
                      {forecast.teamTotals.overloadedCount === 1
                        ? "person"
                        : "people"}{" "}
                      overloaded
                    </div>
                  )}
                  {forecast.teamTotals.totalBlocked > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {Math.round(forecast.teamTotals.totalBlocked)}h blocked
                      time
                    </div>
                  )}
                </div>

                {/* Individual breakdown */}
                <div className="p-6 bg-gray-50 max-h-96 overflow-y-auto">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-3">
                    Team Members
                  </div>
                  <div className="space-y-3">
                    {forecast.resourceCapacity.map((rc) => (
                      <div
                        key={rc.resource.id}
                        className="bg-white rounded p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                rc.isOverloaded
                                  ? "bg-red-100 text-red-700"
                                  : rc.utilizationPercent > 70
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {rc.resource.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">
                                {rc.resource.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {rc.resource.role}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              rc.isOverloaded
                                ? "text-red-600"
                                : rc.utilizationPercent > 70
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {Math.round(rc.utilizationPercent)}%
                          </div>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full ${
                              rc.isOverloaded
                                ? "bg-red-500"
                                : rc.utilizationPercent > 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(rc.utilizationPercent, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(rc.adjustedHours)}h allocated</span>
                          <span>
                            {Math.round(rc.remainingCapacity)}h available
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-600" />
            Capacity Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecasts.map((forecast, idx) => {
              const healthyCount = forecast.resourceCapacity.filter(
                (rc) => !rc.isOverloaded && rc.utilizationPercent < 70,
              ).length;
              const nearCapacityCount = forecast.resourceCapacity.filter(
                (rc) => !rc.isOverloaded && rc.utilizationPercent >= 70,
              ).length;

              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="font-semibold text-sm text-gray-700 mb-3">
                    {forecast.label}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Healthy capacity
                      </span>
                      <span className="font-bold text-gray-900">
                        {healthyCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Near capacity
                      </span>
                      <span className="font-bold text-gray-900">
                        {nearCapacityCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Overloaded
                      </span>
                      <span className="font-bold text-gray-900">
                        {forecast.teamTotals.overloadedCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
