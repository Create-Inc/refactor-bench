import React, { useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Users,
  Clock,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function TeamDashboard({
  resources,
  allocations,
  timeBlocks,
  currentDate,
}) {
  // Calculate metrics for different time periods
  const getMetricsForPeriod = (startDate, endDate, label) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return resources.map((resource) => {
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
      const utilizationPercent = (adjustedHours / targetCapacity) * 100;

      return {
        resource,
        allocatedHours: totalAllocatedHours,
        adjustedHours,
        blockedHours: totalBlockedHours,
        targetCapacity,
        availableCapacity,
        utilizationPercent,
        isOverloaded: utilizationPercent > 90,
        isNearCapacity: utilizationPercent >= 70 && utilizationPercent <= 90,
        isHealthy: utilizationPercent < 70,
      };
    });
  };

  const thisWeek = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return getMetricsForPeriod(start, end, "This Week");
  }, [resources, allocations, timeBlocks, currentDate]);

  const thisMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return getMetricsForPeriod(start, end, "This Month");
  }, [resources, allocations, timeBlocks, currentDate]);

  const overloadedThisWeek = thisWeek.filter((m) => m.isOverloaded);
  const nearCapacityThisWeek = thisWeek.filter((m) => m.isNearCapacity);
  const healthyThisWeek = thisWeek.filter((m) => m.isHealthy);

  const overloadedThisMonth = thisMonth.filter((m) => m.isOverloaded);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {overloadedThisWeek.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Overloaded This Week
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {nearCapacityThisWeek.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Near Capacity
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {healthyThisWeek.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Healthy Load
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {resources.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Total Team Members
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottlenecks & Warnings */}
        {overloadedThisWeek.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-600" size={20} />
              <h3 className="font-bold text-red-900">
                ⚠️ Bottlenecks Detected This Week
              </h3>
            </div>
            <div className="space-y-2">
              {overloadedThisWeek.map((metric) => (
                <div
                  key={metric.resource.id}
                  className="flex items-center justify-between bg-white rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                      {metric.resource.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {metric.resource.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metric.resource.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {Math.round(metric.utilizationPercent)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(metric.adjustedHours)}h /{" "}
                      {Math.round(metric.targetCapacity)}h target
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* This Week Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            This Week (
            {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} -{" "}
            {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")})
          </h3>
          <div className="space-y-3">
            {thisWeek.map((metric) => (
              <div
                key={metric.resource.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        metric.isOverloaded
                          ? "bg-red-100 text-red-700"
                          : metric.isNearCapacity
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {metric.resource.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {metric.resource.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metric.resource.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        metric.isOverloaded
                          ? "text-red-600"
                          : metric.isNearCapacity
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {Math.round(metric.utilizationPercent)}%
                    </div>
                    <div className="text-xs text-gray-500">utilization</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        metric.isOverloaded
                          ? "bg-red-500"
                          : metric.isNearCapacity
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(metric.utilizationPercent, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500">Allocated</div>
                    <div className="font-bold text-gray-900">
                      {Math.round(metric.allocatedHours)}h
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">
                      Target (
                      {Math.round(
                        (metric.resource.target_utilization || 0.75) * 100,
                      )}
                      %)
                    </div>
                    <div className="font-bold text-gray-900">
                      {Math.round(metric.targetCapacity)}h
                    </div>
                  </div>
                  {metric.blockedHours > 0 && (
                    <div>
                      <div className="text-gray-500">Blocked</div>
                      <div className="font-bold text-orange-600">
                        {Math.round(metric.blockedHours)}h
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This Month Overview */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            This Month ({format(startOfMonth(currentDate), "MMMM yyyy")})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thisMonth.map((metric) => (
              <div
                key={metric.resource.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      metric.isOverloaded
                        ? "bg-red-100 text-red-700"
                        : metric.isNearCapacity
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {metric.resource.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">
                      {metric.resource.name}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      metric.isOverloaded
                        ? "text-red-600"
                        : metric.isNearCapacity
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {Math.round(metric.utilizationPercent)}%
                  </div>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${
                      metric.isOverloaded
                        ? "bg-red-500"
                        : metric.isNearCapacity
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(metric.utilizationPercent, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(metric.adjustedHours)}h /{" "}
                  {Math.round(metric.targetCapacity)}h
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
