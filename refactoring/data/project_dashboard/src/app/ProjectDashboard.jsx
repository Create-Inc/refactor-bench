import React, { useMemo } from "react";
import {
  parseISO,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  isWithinInterval,
  differenceInCalendarDays,
} from "date-fns";
import {
  Briefcase,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function ProjectDashboard({
  projects,
  allocations,
  phases,
  resources,
}) {
  const projectMetrics = useMemo(() => {
    return projects.map((project) => {
      const projectAllocations = allocations.filter(
        (a) => a.project_id === project.id,
      );
      const projectPhases = phases.filter((ph) => ph.project_id === project.id);

      // Calculate total hours allocated to this project
      const totalHours = projectAllocations.reduce((acc, alloc) => {
        const start = startOfDay(parseISO(alloc.start_date));
        const end = endOfDay(parseISO(alloc.end_date));
        const days = eachDayOfInterval({ start, end });
        const allocHours = days.length * Number(alloc.hours_per_day);

        // Adjust for effort multiplier
        const resource = resources.find((r) => r.id === alloc.resource_id);
        const multiplier = resource?.effort_multiplier || 1.0;
        return acc + allocHours * multiplier;
      }, 0);

      // Count unique resources assigned
      const uniqueResources = new Set(
        projectAllocations.map((a) => a.resource_id),
      );

      // Calculate project duration
      let earliestStart = null;
      let latestEnd = null;
      projectAllocations.forEach((alloc) => {
        const start = parseISO(alloc.start_date);
        const end = parseISO(alloc.end_date);
        if (!earliestStart || start < earliestStart) earliestStart = start;
        if (!latestEnd || end > latestEnd) latestEnd = end;
      });

      const durationDays =
        earliestStart && latestEnd
          ? differenceInCalendarDays(latestEnd, earliestStart) + 1
          : 0;

      // Calculate total team capacity available for this timeframe
      const totalTeamCapacity = resources.reduce((acc, r) => {
        return (
          acc +
          r.weekly_capacity *
            (r.target_utilization || 0.75) *
            (durationDays / 7)
        );
      }, 0);

      // Capacity utilization percentage
      const capacityUtilization =
        totalTeamCapacity > 0 ? (totalHours / totalTeamCapacity) * 100 : 0;

      // Status determination
      let status = "healthy";
      if (capacityUtilization > 80) status = "critical";
      else if (capacityUtilization > 60) status = "warning";

      // High complexity phase count
      const highComplexityPhases = projectPhases.filter(
        (ph) => ph.complexity === "high",
      ).length;

      return {
        project,
        totalHours: Math.round(totalHours),
        resourceCount: uniqueResources.size,
        phaseCount: projectPhases.length,
        durationDays,
        capacityUtilization,
        status,
        highComplexityPhases,
        earliestStart,
        latestEnd,
      };
    });
  }, [projects, allocations, phases, resources]);

  const sortedMetrics = [...projectMetrics].sort(
    (a, b) => b.totalHours - a.totalHours,
  );

  const totalProjectHours = projectMetrics.reduce(
    (acc, pm) => acc + pm.totalHours,
    0,
  );
  const activeProjects = projectMetrics.filter(
    (pm) => pm.totalHours > 0,
  ).length;
  const criticalProjects = projectMetrics.filter(
    (pm) => pm.status === "critical",
  ).length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Total Projects
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {activeProjects}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Active Projects
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalProjectHours.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Total Hours Allocated
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {criticalProjects}
                </div>
                <div className="text-xs text-gray-500 uppercase font-medium">
                  Over Capacity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Projects Warning */}
        {criticalProjects > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-600" size={20} />
              <h3 className="font-bold text-red-900">
                ⚠️ Projects Exceeding Realistic Capacity
              </h3>
            </div>
            <div className="space-y-2">
              {sortedMetrics
                .filter((pm) => pm.status === "critical")
                .map((metric) => (
                  <div
                    key={metric.project.id}
                    className="flex items-center justify-between bg-white rounded p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: metric.project.color }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {metric.project.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {metric.resourceCount} people · {metric.totalHours}h
                          allocated
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {Math.round(metric.capacityUtilization)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        of realistic capacity
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Projects Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" />
            Project Effort Breakdown
          </h3>
          {sortedMetrics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No projects yet. Create a project to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMetrics.map((metric) => (
                <div
                  key={metric.project.id}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: metric.project.color }}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">
                          {metric.project.name}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {metric.resourceCount}{" "}
                            {metric.resourceCount === 1 ? "person" : "people"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers size={12} />
                            {metric.phaseCount}{" "}
                            {metric.phaseCount === 1 ? "phase" : "phases"}
                          </span>
                          {metric.durationDays > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {metric.durationDays} days
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          metric.status === "critical"
                            ? "text-red-600"
                            : metric.status === "warning"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {metric.totalHours}h
                      </div>
                      <div className="text-xs text-gray-500">total effort</div>
                    </div>
                  </div>

                  {/* Capacity indicator */}
                  {metric.totalHours > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Capacity Utilization</span>
                        <span
                          className={`font-bold ${
                            metric.status === "critical"
                              ? "text-red-600"
                              : metric.status === "warning"
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {Math.round(metric.capacityUtilization)}%
                          {metric.status === "critical" && " - Unrealistic"}
                          {metric.status === "warning" && " - Pushing limits"}
                          {metric.status === "healthy" && " - Realistic"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            metric.status === "critical"
                              ? "bg-red-500"
                              : metric.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(metric.capacityUtilization, 100)}%`,
                          }}
                        />
                      </div>
                      {metric.highComplexityPhases > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                          <AlertTriangle size={12} />
                          {metric.highComplexityPhases} high-complexity{" "}
                          {metric.highComplexityPhases === 1
                            ? "phase"
                            : "phases"}
                        </div>
                      )}
                    </div>
                  )}

                  {metric.totalHours === 0 && (
                    <div className="text-sm text-gray-400 italic">
                      No allocations yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Layers } from "lucide-react";
