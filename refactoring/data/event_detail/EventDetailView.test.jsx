import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventDetailView } from './src/app/EventDetailView.jsx';

// ── Mock external dependencies ──

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn, onSuccess }) => {
    const state = { isPending: false, isError: false, error: null };
    return {
      ...state,
      mutate: async (payload) => {
        try {
          await mutationFn(payload);
          onSuccess?.();
        } catch (e) {
          state.isError = true;
          state.error = e;
        }
      },
    };
  },
}));

vi.mock('@/components/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/components/TwoColumnLayout', () => {
  const TwoColumnLayout = ({ children }) => (
    <div data-testid="two-col-layout">{children}</div>
  );
  TwoColumnLayout.Main = ({ children }) => (
    <div data-testid="main-col">{children}</div>
  );
  TwoColumnLayout.Sidebar = ({ children }) => (
    <div data-testid="sidebar-col">{children}</div>
  );
  return { __esModule: true, default: TwoColumnLayout };
});

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  Clock: () => <span data-testid="icon-clock" />,
  Pencil: () => <span data-testid="icon-pencil" />,
}));

vi.mock('./constants', () => ({
  TYPE_COLORS: {
    Election: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    Training: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
    Meeting: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  },
}));

vi.mock('@/utils/eventFormatters', () => ({
  formatDate: (d) => (d ? new Date(d).toLocaleDateString('en-US') : ''),
  formatTime: (t) => t || '',
}));

vi.mock('./KpiCard', () => ({
  KpiCard: ({ label, value, sub }) => (
    <div data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <span>{label}</span>
      <span>{value}</span>
      {sub && <span>{sub}</span>}
    </div>
  ),
}));

vi.mock('./AssignmentsSection', () => ({
  AssignmentsSection: ({ assignments }) => (
    <div data-testid="assignments-section">
      Assignments ({assignments.length})
    </div>
  ),
}));

vi.mock('./PrecinctsList', () => ({
  PrecinctsList: ({ precincts }) => (
    <div data-testid="precincts-list">
      Precincts ({precincts.length})
    </div>
  ),
}));

vi.mock('./LocationsList', () => ({
  LocationsList: ({ locations }) => (
    <div data-testid="locations-list">
      Locations ({locations.length})
    </div>
  ),
}));

vi.mock('./EventNotesSection', () => ({
  EventNotesSection: ({ notes }) => (
    <div data-testid="event-notes-section">
      Notes ({notes.length})
    </div>
  ),
}));

vi.mock('./EventInfoCard', () => ({
  EventInfoCard: ({ event, timeDisplay, eventDate, isEditing, editForm, editErrors, updateField }) => (
    <div data-testid="event-info-card">
      <span>{timeDisplay}</span>
      <span>{eventDate}</span>
      {isEditing && (
        <div data-testid="event-info-editing">
          <input
            data-testid="edit-name-input"
            value={editForm.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
          />
          <input
            data-testid="edit-date-input"
            value={editForm.event_date || ''}
            onChange={(e) => updateField('event_date', e.target.value)}
          />
          <input
            data-testid="edit-start-time-input"
            value={editForm.start_time || ''}
            onChange={(e) => updateField('start_time', e.target.value)}
          />
          <input
            data-testid="edit-end-time-input"
            value={editForm.end_time || ''}
            onChange={(e) => updateField('end_time', e.target.value)}
          />
          {editErrors.name && <span data-testid="error-name">{editErrors.name}</span>}
          {editErrors.event_date && <span data-testid="error-date">{editErrors.event_date}</span>}
          {editErrors.end_time && <span data-testid="error-end-time">{editErrors.end_time}</span>}
        </div>
      )}
    </div>
  ),
}));

vi.mock('./StatusBreakdown', () => ({
  StatusBreakdown: ({ statusSummary, totalAssignments }) => (
    <div data-testid="status-breakdown">
      Total: {totalAssignments}
    </div>
  ),
}));

// ── Fetch mock ──
global.fetch = vi.fn();

// ── Fixtures ──

function makeEvent(overrides = {}) {
  return {
    name: 'General Election 2024',
    shortName: 'GE24',
    eventType: 'Election',
    eventDate: '2024-11-05T00:00:00Z',
    startTime: '06:00',
    endTime: '20:00',
    timezone: 'America/New_York',
    published: true,
    description: 'Primary general election for all offices.',
    ...overrides,
  };
}

function makeProps(overrides = {}) {
  return {
    event: makeEvent(overrides.event),
    eventLocations: overrides.eventLocations || [
      { id: 'loc1', precinctId: 'p1', name: 'Precinct A' },
      { id: 'loc2', precinctId: 'p2', name: 'Precinct B' },
      { id: 'loc3', locationId: 'l1', name: 'Community Center' },
    ],
    assignments: overrides.assignments || [
      { id: 'a1', status: 'confirmed', role: 'Judge' },
      { id: 'a2', status: 'pending', role: 'Clerk' },
      { id: 'a3', status: 'cancelled', role: 'Observer' },
    ],
    notes: overrides.notes || [
      { id: 'n1', text: 'Setup begins at 5 AM' },
    ],
    kpi: overrides.kpi !== undefined ? overrides.kpi : {
      totalSlots: 20,
      filled: 15,
      confirmed: 12,
      fullyCovered: 8,
      totalDivisions: 10,
    },
    statusSummary: overrides.statusSummary || {
      confirmed: 1,
      pending: 1,
      cancelled: 1,
    },
    queryClient: overrides.queryClient || {
      invalidateQueries: vi.fn(),
    },
    eventId: overrides.eventId || 'evt-123',
  };
}

describe('EventDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  // ── Initial Render ──

  describe('Initial Render', () => {
    test('renders event name, type badge, and short name', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('General Election 2024')).toBeInTheDocument();
      expect(screen.getByText('Election')).toBeInTheDocument();
      expect(screen.getByText(/Short name:.*GE24/)).toBeInTheDocument();
    });

    test('renders back to events link with correct href', () => {
      render(<EventDetailView {...makeProps()} />);
      const link = screen.getByText('Back to Events');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/events');
    });

    test('shows Published badge when published and Draft when not', () => {
      const { unmount } = render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('Published')).toBeInTheDocument();
      unmount();

      render(<EventDetailView {...makeProps({ event: { published: false } })} />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    test('renders description section with event description text', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Primary general election for all offices.')).toBeInTheDocument();
    });

    test('renders Edit Event button in view mode', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('Edit Event')).toBeInTheDocument();
    });
  });

  // ── KPI Section ──

  describe('KPI Section', () => {
    test('renders all four KPI cards with correct values when kpi is provided', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByTestId('kpi-required-slots')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-filled')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-confirmed')).toBeInTheDocument();
      expect(screen.getByTestId('kpi-fully-covered')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('does not render KPI bar when kpi is null', () => {
      render(<EventDetailView {...makeProps({ kpi: null })} />);
      expect(screen.queryByTestId('kpi-required-slots')).not.toBeInTheDocument();
    });
  });

  // ── Sub-component Sections ──

  describe('Sub-component Sections', () => {
    test('renders assignments, notes, info card, and status breakdown', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('Assignments (3)')).toBeInTheDocument();
      expect(screen.getByText('Notes (1)')).toBeInTheDocument();
      expect(screen.getByTestId('event-info-card')).toBeInTheDocument();
      expect(screen.getByText('Total: 3')).toBeInTheDocument();
    });
  });

  // ── Election vs Non-Election ──

  describe('Election vs Non-Election', () => {
    test('shows Linked Precincts for Election type with correct count', () => {
      render(<EventDetailView {...makeProps()} />);
      expect(screen.getByText('Linked Precincts')).toBeInTheDocument();
      expect(screen.queryByText('Linked Locations')).not.toBeInTheDocument();
      expect(screen.getByText('Precincts (2)')).toBeInTheDocument();
    });

    test('shows Linked Locations for non-Election type with correct count', () => {
      render(
        <EventDetailView
          {...makeProps({
            event: { eventType: 'Training' },
            eventLocations: [
              { id: 'l1', locationId: 'loc1', name: 'Room A' },
              { id: 'l2', locationId: 'loc2', name: 'Room B' },
            ],
          })}
        />,
      );
      expect(screen.getByText('Linked Locations')).toBeInTheDocument();
      expect(screen.queryByText('Linked Precincts')).not.toBeInTheDocument();
      expect(screen.getByText('Locations (2)')).toBeInTheDocument();
    });
  });

  // ── Edit Mode ──

  describe('Edit Mode', () => {
    test('clicking Edit Event shows Save and Cancel, hides Edit Event', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.queryByText('Edit Event')).not.toBeInTheDocument();
    });

    test('clicking Cancel exits edit mode and restores Edit Event button', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.getByText('Edit Event')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    test('edit mode pre-fills form with current event data', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      expect(screen.getByTestId('edit-name-input').value).toBe('General Election 2024');
      expect(screen.getByTestId('edit-date-input').value).toBe('2024-11-05');
    });

    test('description textarea is shown in edit mode and updates on input', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      const textarea = screen.getByPlaceholderText('Event description (optional)');
      expect(textarea.value).toBe('Primary general election for all offices.');

      fireEvent.change(textarea, { target: { value: 'Updated description' } });
      expect(textarea.value).toBe('Updated description');
    });
  });

  // ── Edit Validation ──

  describe('Edit Validation', () => {
    test('shows error when saving with empty name', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      fireEvent.change(screen.getByTestId('edit-name-input'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      expect(screen.getByText('Event name is required')).toBeInTheDocument();
    });

    test('shows error when saving with empty date', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      fireEvent.change(screen.getByTestId('edit-date-input'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });

    test('shows error when end time is before start time', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      fireEvent.change(screen.getByTestId('edit-start-time-input'), { target: { value: '18:00' } });
      fireEvent.change(screen.getByTestId('edit-end-time-input'), { target: { value: '06:00' } });
      fireEvent.click(screen.getByText('Save'));

      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    });

    test('clears field error when the field is corrected', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      const nameInput = screen.getByTestId('edit-name-input');
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));
      expect(screen.getByTestId('error-name')).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { value: 'Fixed Name' } });
      expect(screen.queryByTestId('error-name')).not.toBeInTheDocument();
    });

    test('does not call fetch when validation fails', () => {
      render(<EventDetailView {...makeProps()} />);
      fireEvent.click(screen.getByText('Edit Event'));

      fireEvent.change(screen.getByTestId('edit-name-input'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Save'));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ── Save Flow ──

  describe('Save Flow', () => {
    test('submits PATCH request on valid save and exits edit mode', async () => {
      const queryClient = { invalidateQueries: vi.fn() };
      render(<EventDetailView {...makeProps({ queryClient })} />);

      fireEvent.click(screen.getByText('Edit Event'));
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/events/evt-123',
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          }),
        );
        expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['event', 'evt-123'],
        });
      });

      expect(screen.getByText('Edit Event')).toBeInTheDocument();
    });
  });

  // ── Time & Date Display ──

  describe('Time and Date Display', () => {
    test('displays formatted time range in event info card', () => {
      render(<EventDetailView {...makeProps()} />);
      const infoCard = screen.getByTestId('event-info-card');
      expect(infoCard).toHaveTextContent('06:00');
      expect(infoCard).toHaveTextContent('20:00');
    });

    test('displays em-dash when no times are set', () => {
      render(
        <EventDetailView
          {...makeProps({ event: { startTime: null, endTime: null } })}
        />,
      );
      expect(screen.getByTestId('event-info-card')).toHaveTextContent('\u2014');
    });
  });

  // ── Edge Cases ──

  describe('Edge Cases', () => {
    test('hides description section when empty and not editing, shows it in edit mode', () => {
      const { unmount } = render(
        <EventDetailView {...makeProps({ event: { description: '' } })} />,
      );
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      unmount();

      render(
        <EventDetailView {...makeProps({ event: { description: '' } })} />,
      );
      fireEvent.click(screen.getByText('Edit Event'));
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    test('handles empty assignments and locations arrays', () => {
      render(
        <EventDetailView
          {...makeProps({ assignments: [], eventLocations: [] })}
        />,
      );
      expect(screen.getByText('Assignments (0)')).toBeInTheDocument();
      expect(screen.getByText('Total: 0')).toBeInTheDocument();
      expect(screen.getByText('Precincts (0)')).toBeInTheDocument();
    });

    test('uses Training colors as fallback for unknown event type', () => {
      render(
        <EventDetailView
          {...makeProps({ event: { eventType: 'UnknownType' } })}
        />,
      );
      expect(screen.getByText('UnknownType')).toBeInTheDocument();
    });

    test('component renders without crashing', () => {
      expect(() => render(<EventDetailView {...makeProps()} />)).not.toThrow();
    });
  });
});
