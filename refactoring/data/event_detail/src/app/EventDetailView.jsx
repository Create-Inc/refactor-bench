import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import TwoColumnLayout from "@/components/TwoColumnLayout";
import { ArrowLeft, CheckCircle2, Clock, Pencil } from "lucide-react";
import { TYPE_COLORS } from "./constants";
import { formatDate, formatTime } from "@/utils/eventFormatters";
import { KpiCard } from "./KpiCard";
import { AssignmentsSection } from "./AssignmentsSection";
import { PrecinctsList } from "./PrecinctsList";
import { LocationsList } from "./LocationsList";
import { EventNotesSection } from "./EventNotesSection";
import { EventInfoCard } from "./EventInfoCard";
import { StatusBreakdown } from "./StatusBreakdown";

export function EventDetailView({
  event,
  eventLocations,
  assignments,
  notes,
  kpi,
  statusSummary,
  queryClient,
  eventId,
}) {
  const colors = TYPE_COLORS[event.eventType] || TYPE_COLORS.Training;
  const isElection = event.eventType === "Election";

  const precincts = eventLocations.filter((el) => el.precinctId);
  const genericLocations = eventLocations.filter(
    (el) => el.locationId && !el.precinctId,
  );

  const timeDisplay =
    event.startTime && event.endTime
      ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
      : event.startTime
        ? formatTime(event.startTime)
        : "—";

  const formattedDate = formatDate(event.eventDate);

  // ── Edit mode state ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const updateEventMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update event");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setIsEditing(false);
      setEditErrors({});
    },
  });

  const handleStartEdit = () => {
    const dateStr = event.eventDate ? event.eventDate.split("T")[0] : "";
    setEditForm({
      name: event.name || "",
      short_name: event.shortName || "",
      event_type: event.eventType || "Election",
      event_date: dateStr,
      start_time: event.startTime || "",
      end_time: event.endTime || "",
      timezone: event.timezone || "America/New_York",
      published: event.published || false,
      description: event.description || "",
    });
    setEditErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
    setEditErrors({});
  };

  const handleSaveEdit = () => {
    const errors = {};
    if (!editForm.name || !editForm.name.trim()) {
      errors.name = "Event name is required";
    }
    if (!editForm.event_date) {
      errors.event_date = "Date is required";
    }
    if (
      editForm.start_time &&
      editForm.end_time &&
      editForm.start_time >= editForm.end_time
    ) {
      errors.end_time = "End time must be after start time";
    }
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});
    updateEventMutation.mutate(editForm);
  };

  const updateField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <a
          href="/events"
          className="inline-flex items-center gap-2 text-[#4A69BD] hover:underline mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back to Events
        </a>

        {/* Event Header */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditing ? editForm.name || event.name : event.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {isEditing
                    ? editForm.event_type || event.eventType
                    : event.eventType}
                </span>
              </div>
              {!isEditing && event.shortName && (
                <p className="text-sm text-gray-500">
                  Short name: {event.shortName}
                </p>
              )}
              {isEditing && (
                <p className="text-sm text-gray-500">
                  Short name: {editForm.short_name || "—"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={updateEventMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateEventMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#4A69BD] rounded hover:bg-[#3d5aa8] disabled:opacity-50 flex items-center gap-2"
                  >
                    {updateEventMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  {event.published ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded">
                      <CheckCircle2 size={14} /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-300 rounded">
                      <Clock size={14} /> Draft
                    </span>
                  )}
                  <button
                    onClick={handleStartEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil size={14} /> Edit Event
                  </button>
                </>
              )}
            </div>
          </div>
          {updateEventMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {updateEventMutation.error.message}
            </div>
          )}
        </div>

        {/* KPI Bar for Elections */}
        {kpi && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Required Slots"
              value={kpi.totalSlots}
              sub="A–E × divisions"
            />
            <KpiCard
              label="Filled"
              value={kpi.filled}
              sub={`of ${kpi.totalSlots}`}
              color={
                kpi.filled >= kpi.totalSlots
                  ? "text-green-700"
                  : "text-orange-600"
              }
            />
            <KpiCard
              label="Confirmed"
              value={kpi.confirmed}
              sub={`of ${kpi.filled} filled`}
              color="text-blue-700"
            />
            <KpiCard
              label="Fully Covered"
              value={kpi.fullyCovered}
              sub={`of ${kpi.totalDivisions} divisions`}
              color={
                kpi.fullyCovered >= kpi.totalDivisions
                  ? "text-green-700"
                  : "text-orange-600"
              }
            />
          </div>
        )}

        <TwoColumnLayout>
          <TwoColumnLayout.Main>
            {/* Description */}
            {(event.description || isEditing) && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-800">
                    Description
                  </h2>
                </div>
                <div className="p-6">
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Event description (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4A69BD] resize-none"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Assignments */}
            <AssignmentsSection
              eventId={eventId}
              isElection={isElection}
              assignments={assignments}
              precincts={precincts}
              genericLocations={genericLocations}
              queryClient={queryClient}
            />

            {/* Linked Precincts / Locations */}
            {isElection ? (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">
                    Linked Precincts
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                    {precincts.length}
                  </span>
                </div>
                <div className="p-6">
                  <PrecinctsList precincts={precincts} />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-300 bg-gray-50 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800">
                    Linked Locations
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
                    {genericLocations.length}
                  </span>
                </div>
                <div className="p-6">
                  <LocationsList locations={genericLocations} />
                </div>
              </div>
            )}

            {/* Event Notes */}
            <EventNotesSection
              eventId={eventId}
              notes={notes}
              queryClient={queryClient}
            />
          </TwoColumnLayout.Main>

          <TwoColumnLayout.Sidebar>
            {/* Event Info */}
            <EventInfoCard
              event={event}
              timeDisplay={timeDisplay}
              isElection={isElection}
              precinctsCount={precincts.length}
              locationsCount={genericLocations.length}
              participantsCount={
                assignments.filter((a) => a.status !== "cancelled").length
              }
              eventDate={formattedDate}
              isEditing={isEditing}
              editForm={editForm}
              editErrors={editErrors}
              updateField={updateField}
            />

            {/* Participants Summary */}
            <StatusBreakdown
              statusSummary={statusSummary}
              totalAssignments={assignments.length}
            />
          </TwoColumnLayout.Sidebar>
        </TwoColumnLayout>
      </div>
    </Layout>
  );
}
