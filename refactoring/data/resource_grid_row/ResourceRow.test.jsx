import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceRow } from './src/app/ResourceRow.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Zap: (props) => <svg data-testid="zap-icon" {...props} />,
  AlertTriangle: (props) => <svg data-testid="alert-triangle-icon" {...props} />,
  Shuffle: (props) => <svg data-testid="shuffle-icon" {...props} />,
}));

// Mock date-fns functions for deterministic tests
vi.mock('date-fns', () => ({
  parseISO: (str) => new Date(str),
  startOfDay: (d) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  },
  endOfDay: (d) => {
    const copy = new Date(d);
    copy.setHours(23, 59, 59, 999);
    return copy;
  },
  isWithinInterval: (date, { start, end }) => {
    const t = date.getTime();
    return t >= start.getTime() && t <= end.getTime();
  },
  isSameDay: (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  },
}));

const baseResource = {
  name: 'Alice Johnson',
  role: 'Senior Developer',
  weekly_capacity: 40,
  effort_multiplier: 1.0,
  target_utilization: 0.75,
};

// A single day (today) for simplified timeline tests
const today = new Date('2026-04-11T12:00:00.000Z');
const days = [today];

const mockAllocations = [
  {
    id: 1,
    start_date: '2026-04-10',
    end_date: '2026-04-12',
    hours_per_day: 4,
    project_name: 'Project Alpha',
    project_color: '#3b82f6',
    phase_name: 'Design',
    complexity: 'high',
  },
  {
    id: 2,
    start_date: '2026-04-11',
    end_date: '2026-04-11',
    hours_per_day: 2,
    project_name: 'Project Beta',
    project_color: '#10b981',
    phase_name: '',
    complexity: 'low',
  },
];

const mockTimeBlocks = [
  {
    id: 10,
    start_date: '2026-04-11',
    end_date: '2026-04-11',
    hours_per_day: 1,
    block_type: 'PTO',
    description: 'Personal day',
  },
];

describe('ResourceRow Component', () => {
  let onReassignAllocation;

  beforeEach(() => {
    vi.clearAllMocks();
    onReassignAllocation = vi.fn();
  });

  function renderComponent(props = {}) {
    return render(
      <ResourceRow
        resource={baseResource}
        days={days}
        allocations={mockAllocations}
        timeBlocks={mockTimeBlocks}
        onReassignAllocation={onReassignAllocation}
        {...props}
      />
    );
  }

  describe('Resource Sidebar', () => {
    test('displays resource name and role', () => {
      renderComponent();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    test('displays first letter avatar', () => {
      renderComponent();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    test('shows target load label with utilization percentage', () => {
      renderComponent();
      expect(screen.getByText(/Target Load \(75%\)/)).toBeInTheDocument();
    });

    test('does not show efficiency label for standard multiplier (1.0)', () => {
      renderComponent();
      expect(screen.queryByText(/Senior \(1/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Junior/)).not.toBeInTheDocument();
    });

    test('shows Senior label for effort multiplier > 1.0', () => {
      renderComponent({
        resource: { ...baseResource, effort_multiplier: 1.5 },
      });
      expect(screen.getByText(/Senior \(1\.5x\)/)).toBeInTheDocument();
    });

    test('shows Junior label for effort multiplier < 1.0', () => {
      renderComponent({
        resource: { ...baseResource, effort_multiplier: 0.8 },
      });
      expect(screen.getByText(/Junior \(0\.8x\)/)).toBeInTheDocument();
    });

    test('displays available hours', () => {
      renderComponent();
      // weekly_capacity=40, blocked=1h, adjusted_weekly=6h (4+2)*1.0
      // actualAvailable = 40 - 1 = 39
      // available = max(39 - 6, 0) = 33
      expect(screen.getByText(/Available: 33h/)).toBeInTheDocument();
    });

    test('displays blocked hours when time blocks exist', () => {
      renderComponent();
      expect(screen.getByText(/Blocked: 1h/)).toBeInTheDocument();
    });

    test('does not show blocked hours label when no time blocks', () => {
      renderComponent({ timeBlocks: [] });
      expect(screen.queryByText(/Blocked:/)).not.toBeInTheDocument();
    });

    test('displays hours vs target capacity', () => {
      renderComponent();
      // targetCapacity = 40 * 0.75 = 30
      // adjustedWeeklyHours = 6 * 1.0 = 6
      expect(screen.getByText(/6h \/ 30h/)).toBeInTheDocument();
    });
  });

  describe('Timeline Cells', () => {
    test('renders allocation blocks for allocations matching the day', () => {
      renderComponent();
      // Both allocations include today
      expect(screen.getByText('4h')).toBeInTheDocument();
      expect(screen.getByText('2h')).toBeInTheDocument();
    });

    test('renders phase name in allocation block', () => {
      renderComponent();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    test('renders project name when phase name is empty', () => {
      renderComponent();
      expect(screen.getByText('Project Beta')).toBeInTheDocument();
    });

    test('renders complexity labels', () => {
      renderComponent();
      // high complexity shows warning
      expect(screen.getByText(/Complex/)).toBeInTheDocument();
      // low complexity shows checkmark
      expect(screen.getByText(/Simple/)).toBeInTheDocument();
    });

    test('renders time block entries', () => {
      renderComponent();
      expect(screen.getByText('1h')).toBeInTheDocument();
      expect(screen.getByText('PTO')).toBeInTheDocument();
    });

    test('calls onReassignAllocation when clicking an allocation', () => {
      renderComponent();
      // Click on the allocation showing "Design"
      fireEvent.click(screen.getByText('Design').closest('[class*="cursor-pointer"]'));
      expect(onReassignAllocation).toHaveBeenCalledWith(mockAllocations[0]);
    });

    test('shows over-capacity warning when hours exceed daily capacity', () => {
      // daily capacity = 40/5 = 8
      // totalHours = 4 + 2 = 6, blocked = 1, total = 7 < 8 => no warning
      // Let's push over: add more hours
      const heavyAllocations = [
        ...mockAllocations,
        {
          id: 3,
          start_date: '2026-04-11',
          end_date: '2026-04-11',
          hours_per_day: 5,
          project_name: 'Project Gamma',
          project_color: '#ef4444',
          phase_name: 'Rush',
          complexity: 'medium',
        },
      ];
      renderComponent({ allocations: heavyAllocations });
      // totalHours = 4+2+5=11, blocked=1, 12 > 8 => over capacity
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });

    test('does not show over-capacity warning when under daily limit', () => {
      renderComponent();
      expect(
        screen.queryByTestId('alert-triangle-icon')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty allocations and time blocks', () => {
      renderComponent({ allocations: [], timeBlocks: [] });
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText(/Available: 40h/)).toBeInTheDocument();
    });

    test('handles resource with no target_utilization (defaults to 0.75)', () => {
      renderComponent({
        resource: { ...baseResource, target_utilization: undefined },
        allocations: [],
        timeBlocks: [],
      });
      expect(screen.getByText(/Target Load \(75%\)/)).toBeInTheDocument();
    });
  });
});
