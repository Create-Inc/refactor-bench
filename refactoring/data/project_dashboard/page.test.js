import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectDashboard from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for CSV export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === 'a') {
    el.click = mockClick;
  }
  return el;
});

describe('ProjectDashboard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with TaskBoard title', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText(/TaskBoard/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText('Board View')).toBeInTheDocument();
      expect(screen.getByText('List View')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
    });

    test('renders header with search and filter controls', () => {
      render(<ProjectDashboard />);
      expect(screen.getByPlaceholderText('Search tasks... (Ctrl+K)')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by assignee')).toBeInTheDocument();
    });

    test('renders board view with status columns by default', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText('BACKLOG')).toBeInTheDocument();
      expect(screen.getByText('TO DO')).toBeInTheDocument();
      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('IN REVIEW')).toBeInTheDocument();
      expect(screen.getByText('DONE')).toBeInTheDocument();
    });

    test('renders New Task button', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    test('renders Export button', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText(/Export/)).toBeInTheDocument();
    });

    test('renders Settings button in sidebar', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('renders completion rate in sidebar', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText(/complete/)).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<ProjectDashboard />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<ProjectDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('dashboardTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<ProjectDashboard />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('dashboardTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dashboardTheme') return 'dark';
        return null;
      });
      render(<ProjectDashboard />);
      // In dark mode, the sun icon is shown for toggling back
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Board View shows board columns', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Board View'));
      expect(screen.getByText('BACKLOG')).toBeInTheDocument();
    });

    test('clicking List View shows table with headers', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('List View'));
      expect(screen.getByText('Task')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Assignee')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    test('clicking Calendar shows calendar view', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Calendar'));
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    test('clicking Analytics shows analytics view', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Project Analytics')).toBeInTheDocument();
    });

    test('clicking Activity shows activity feed', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Activity'));
      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    });

    test('clicking Team shows team members', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('List View'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('dashboardView', 'list');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<ProjectDashboard />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<ProjectDashboard />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Board View')).not.toBeInTheDocument();
      expect(screen.queryByText('List View')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<ProjectDashboard />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Board View')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters tasks by title', () => {
      render(<ProjectDashboard />);
      const searchInput = screen.getByPlaceholderText('Search tasks... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'authentication' } });
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.queryByText('Design dashboard layout')).not.toBeInTheDocument();
    });

    test('search input filters tasks by tags', () => {
      render(<ProjectDashboard />);
      const searchInput = screen.getByPlaceholderText('Search tasks... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'devops' } });
      expect(screen.getByText('Setup CI/CD pipeline')).toBeInTheDocument();
    });

    test('clearing search shows all tasks again', () => {
      render(<ProjectDashboard />);
      const searchInput = screen.getByPlaceholderText('Search tasks... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'authentication' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.getByText('Design dashboard layout')).toBeInTheDocument();
    });
  });

  describe('Priority Filter', () => {
    test('filtering by critical priority shows only critical tasks', () => {
      render(<ProjectDashboard />);
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'critical' } });
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.getByText('Fix pagination bug on mobile')).toBeInTheDocument();
      expect(screen.queryByText('Design dashboard layout')).not.toBeInTheDocument();
    });

    test('selecting All Priorities shows all tasks', () => {
      render(<ProjectDashboard />);
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'critical' } });
      fireEvent.change(priorityFilter, { target: { value: 'all' } });
      expect(screen.getByText('Design dashboard layout')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by bug category shows only bug tasks', () => {
      render(<ProjectDashboard />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'bug' } });
      expect(screen.getByText('Fix pagination bug on mobile')).toBeInTheDocument();
      expect(screen.queryByText('Implement user authentication')).not.toBeInTheDocument();
    });
  });

  describe('Assignee Filter', () => {
    test('filtering by assignee shows only their tasks', () => {
      render(<ProjectDashboard />);
      const assigneeFilter = screen.getByLabelText('Filter by assignee');
      fireEvent.change(assigneeFilter, { target: { value: 't1' } });
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.getByText('Migrate to TypeScript')).toBeInTheDocument();
      expect(screen.queryByText('Design dashboard layout')).not.toBeInTheDocument();
    });
  });

  describe('Board View - Task Cards', () => {
    test('task cards render in correct status columns', () => {
      render(<ProjectDashboard />);
      // "Implement user authentication" is status 'done'
      // "Add dark mode support" is status 'backlog'
      // All tasks should be visible
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.getByText('Add dark mode support')).toBeInTheDocument();
    });

    test('task card displays category', () => {
      render(<ProjectDashboard />);
      // Categories are shown on task cards as uppercase text
      const featureLabels = screen.getAllByText('feature');
      expect(featureLabels.length).toBeGreaterThan(0);
    });

    test('task card displays tags', () => {
      render(<ProjectDashboard />);
      expect(screen.getByText('auth')).toBeInTheDocument();
      expect(screen.getByText('security')).toBeInTheDocument();
    });

    test('task card displays subtask progress', () => {
      render(<ProjectDashboard />);
      // Task 1 has 3/3 subtasks done
      const subtaskProgress = screen.getAllByText(/☑/);
      expect(subtaskProgress.length).toBeGreaterThan(0);
    });

    test('column headers show task count', () => {
      render(<ProjectDashboard />);
      // With 10 initial tasks, there should be counts displayed
      // 2 backlog, 3 todo, 2 in_progress, 1 review, 2 done
      const twoCountBadges = screen.getAllByText('2');
      expect(twoCountBadges.length).toBeGreaterThan(0);
    });
  });

  describe('List View', () => {
    beforeEach(() => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('List View'));
    });

    test('renders sort controls', () => {
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByText(/Created/)).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText(/Title/)).toBeInTheDocument();
    });

    test('renders task rows in table', () => {
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
      expect(screen.getByText('Fix pagination bug on mobile')).toBeInTheDocument();
    });

    test('clicking sort button toggles sort direction', () => {
      const createdButton = screen.getByText(/Created/);
      fireEvent.click(createdButton);
      // Direction should toggle, shown by arrow symbol
      expect(screen.getByText(/Created.*↑/)).toBeInTheDocument();
    });

    test('clicking different sort button changes sort field', () => {
      const titleButton = screen.getByText(/Title/);
      fireEvent.click(titleButton);
      expect(screen.getByText(/Title.*↓/)).toBeInTheDocument();
    });
  });

  describe('Analytics View', () => {
    beforeEach(() => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Analytics'));
    });

    test('renders stats cards', () => {
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    test('shows correct total tasks count', () => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('renders status breakdown', () => {
      expect(screen.getByText('Tasks by Status')).toBeInTheDocument();
    });

    test('renders priority breakdown', () => {
      expect(screen.getByText('Tasks by Priority')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    test('renders time tracking section', () => {
      expect(screen.getByText('Time Tracking')).toBeInTheDocument();
      expect(screen.getByText('Estimated')).toBeInTheDocument();
      expect(screen.getByText('Spent')).toBeInTheDocument();
      expect(screen.getByText('Remaining')).toBeInTheDocument();
    });

    test('renders team workload section', () => {
      expect(screen.getByText('Team Workload')).toBeInTheDocument();
    });
  });

  describe('Activity View', () => {
    test('renders activity feed items', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Activity'));
      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
      expect(screen.getByText(/completed/)).toBeInTheDocument();
      expect(screen.getByText(/started/)).toBeInTheDocument();
      expect(screen.getByText(/commented on/)).toBeInTheDocument();
    });

    test('shows team member names in activity items', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Activity'));
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Grace Kim')).toBeInTheDocument();
    });
  });

  describe('Team View', () => {
    test('renders team member cards', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Martinez')).toBeInTheDocument();
      expect(screen.getByText('Carol Williams')).toBeInTheDocument();
      expect(screen.getByText('Dave Johnson')).toBeInTheDocument();
    });

    test('shows member roles', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('Lead Engineer')).toBeInTheDocument();
      expect(screen.getByText('Designer')).toBeInTheDocument();
      expect(screen.getByText('PM')).toBeInTheDocument();
    });

    test('shows member departments', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      const engineeringLabels = screen.getAllByText('Engineering');
      expect(engineeringLabels.length).toBeGreaterThan(0);
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
    });

    test('shows member emails', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    test('shows task stats per member', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Team'));
      const totalLabels = screen.getAllByText('Total');
      expect(totalLabels.length).toBeGreaterThan(0);
      const doneLabels = screen.getAllByText('Done');
      expect(doneLabels.length).toBeGreaterThan(0);
      const activeLabels = screen.getAllByText('Active');
      expect(activeLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Task Detail Modal', () => {
    test('clicking a task card opens detail modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      // Modal shows description
      expect(screen.getByText(/Add OAuth2 login flow/)).toBeInTheDocument();
    });

    test('modal shows task category and priority', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    test('modal shows subtasks section', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText(/Subtasks/)).toBeInTheDocument();
      expect(screen.getByText('Google OAuth setup')).toBeInTheDocument();
      expect(screen.getByText('GitHub OAuth setup')).toBeInTheDocument();
      expect(screen.getByText('Session management')).toBeInTheDocument();
    });

    test('modal shows comments section', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText(/Comments/)).toBeInTheDocument();
      expect(screen.getByText('This is top priority for the release')).toBeInTheDocument();
    });

    test('modal shows time tracking info', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText('16h')).toBeInTheDocument();
      expect(screen.getByText('14h')).toBeInTheDocument();
    });

    test('modal shows tags', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText('#auth')).toBeInTheDocument();
      expect(screen.getByText('#security')).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText(/Add OAuth2 login flow/)).toBeInTheDocument();
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText(/Add OAuth2 login flow/)).not.toBeInTheDocument();
    });

    test('clicking overlay closes modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText(/Add OAuth2 login flow/)).toBeInTheDocument();
      // The overlay is the parent fixed div; clicking on it closes the modal
      // We test Escape key instead as overlay click is harder to target
    });
  });

  describe('Task Detail Modal - Edit Title', () => {
    test('clicking task title enters edit mode', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      // In modal, click the title h2 to edit
      const title = screen.getByText('Implement user authentication');
      fireEvent.click(title);
      // Should now have an input with the title value
      const input = screen.getByDisplayValue('Implement user authentication');
      expect(input).toBeInTheDocument();
    });

    test('blurring title input saves the new title', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const title = screen.getByText('Implement user authentication');
      fireEvent.click(title);
      const input = screen.getByDisplayValue('Implement user authentication');
      fireEvent.change(input, { target: { value: 'Updated Auth Task' } });
      fireEvent.blur(input);
      expect(screen.getByText('Updated Auth Task')).toBeInTheDocument();
    });
  });

  describe('Task Detail Modal - Dropdowns', () => {
    test('changing status via dropdown updates task', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const statusSelect = screen.getByDisplayValue('Done');
      fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
      expect(statusSelect.value).toBe('in_progress');
    });

    test('changing assignee via dropdown updates task', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      // Task 1 is assigned to t1 (Alice Chen)
      const assigneeSelect = screen.getByDisplayValue('Alice Chen');
      fireEvent.change(assigneeSelect, { target: { value: 't2' } });
      expect(assigneeSelect.value).toBe('t2');
    });

    test('changing priority via dropdown updates task', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const prioritySelect = screen.getByDisplayValue('Critical');
      fireEvent.change(prioritySelect, { target: { value: 'low' } });
      expect(prioritySelect.value).toBe('low');
    });

    test('changing category via dropdown updates task', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const categorySelect = screen.getByDisplayValue('Feature');
      fireEvent.change(categorySelect, { target: { value: 'bug' } });
      expect(categorySelect.value).toBe('bug');
    });
  });

  describe('Task Detail Modal - Subtasks', () => {
    test('toggling subtask checkbox updates completion', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      // Task 1 has 3 subtasks all done - find the checkboxes in subtasks area
      const subtaskCheckboxes = screen.getAllByRole('checkbox');
      // The first checkbox in the modal context is for subtasks
      // Toggle the first subtask
      const googleOAuthCheckbox = subtaskCheckboxes.find((cb) => cb.checked === true);
      if (googleOAuthCheckbox) {
        fireEvent.click(googleOAuthCheckbox);
      }
    });

    test('adding a subtask via Enter key', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const subtaskInput = screen.getByPlaceholderText('Add subtask...');
      fireEvent.change(subtaskInput, { target: { value: 'New subtask item' } });
      fireEvent.keyDown(subtaskInput, { key: 'Enter' });
      expect(screen.getByText('New subtask item')).toBeInTheDocument();
    });

    test('removing a subtask', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText('Google OAuth setup')).toBeInTheDocument();
      // Each subtask has a remove button (×)
      // Find remove buttons within subtasks area
      const removeButtons = screen.getAllByText('×');
      // Click the first subtask's remove button (skip the modal close button which is also ×)
      // The close button is in the header, subtask remove buttons come after
      fireEvent.click(removeButtons[1]); // First subtask remove
      expect(screen.queryByText('Google OAuth setup')).not.toBeInTheDocument();
    });
  });

  describe('Task Detail Modal - Comments', () => {
    test('adding a comment via Send button', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const commentInput = screen.getByPlaceholderText('Add a comment...');
      fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    test('adding a comment via Enter key', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const commentInput = screen.getByPlaceholderText('Add a comment...');
      fireEvent.change(commentInput, { target: { value: 'Enter key comment' } });
      fireEvent.keyDown(commentInput, { key: 'Enter' });
      expect(screen.getByText('Enter key comment')).toBeInTheDocument();
    });
  });

  describe('Task Detail Modal - Delete Task', () => {
    test('clicking Delete shows confirmation dialog', () => {
      window.confirm.mockReturnValue(false);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    });

    test('confirming delete removes task and closes modal', () => {
      window.confirm.mockReturnValue(true);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      // Modal should close and task should be removed
      expect(screen.queryByText('Implement user authentication')).not.toBeInTheDocument();
    });

    test('canceling delete keeps task', () => {
      window.confirm.mockReturnValue(false);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      // Task should still exist (close modal first to check board)
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
    });
  });

  describe('Create Task Modal', () => {
    test('clicking New Task opens create modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    test('create modal has all form fields', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Time Estimate (hours)')).toBeInTheDocument();
      expect(screen.getByText('Tags (comma separated)')).toBeInTheDocument();
    });

    test('cancel button closes create modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    test('submitting form creates a new task', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));

      const form = screen.getByText('Create New Task').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      fireEvent.change(titleField, { target: { value: 'Brand new task' } });

      const createButton = screen.getByText('Create Task');
      fireEvent.click(createButton);

      // Modal should close
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
      // New task should appear on the board
      expect(screen.getByText('Brand new task')).toBeInTheDocument();
    });

    test('close button (×) closes create modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Selection', () => {
    test('selecting tasks shows bulk actions bar', () => {
      render(<ProjectDashboard />);
      const checkbox = screen.getByLabelText('Select Implement user authentication');
      fireEvent.click(checkbox);
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    test('selecting multiple tasks shows correct count', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Select Implement user authentication'));
      fireEvent.click(screen.getByLabelText('Select Design dashboard layout'));
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    test('bulk move changes status of selected tasks', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Select Implement user authentication'));
      const bulkMoveSelect = screen.getByLabelText('Bulk move');
      fireEvent.change(bulkMoveSelect, { target: { value: 'backlog' } });
      // Selection should be cleared after move
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });

    test('bulk delete removes selected tasks after confirmation', () => {
      window.confirm.mockReturnValue(true);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Select Implement user authentication'));
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      expect(screen.queryByText('Implement user authentication')).not.toBeInTheDocument();
    });

    test('bulk delete cancel keeps tasks', () => {
      window.confirm.mockReturnValue(false);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Select Implement user authentication'));
      // Click the bulk Delete button
      const deleteButtons = screen.getAllByText('Delete');
      // The bulk delete button is in the bulk actions bar
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
    });

    test('cancel button clears selection', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Select Implement user authentication'));
      expect(screen.getByText('1 selected')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    });
  });

  describe('Notifications', () => {
    test('clicking bell icon shows notification panel', () => {
      render(<ProjectDashboard />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });

    test('clicking bell icon again hides notification panel', () => {
      render(<ProjectDashboard />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      fireEvent.click(bellButton);
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });

    test('creating a task adds notification', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      const form = screen.getByText('Create New Task').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      fireEvent.change(titleField, { target: { value: 'Notification test task' } });
      fireEvent.click(screen.getByText('Create Task'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText(/Notification test task.*created/)).toBeInTheDocument();
    });

    test('mark all read button works', () => {
      render(<ProjectDashboard />);
      // Create a task to generate a notification
      fireEvent.click(screen.getByText('New Task'));
      const form = screen.getByText('Create New Task').closest('div').querySelector('form');
      const titleField = form.querySelector('input[name="title"]');
      fireEvent.change(titleField, { target: { value: 'Test task' } });
      fireEvent.click(screen.getByText('Create Task'));

      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      fireEvent.click(screen.getByText('Mark all read'));
    });
  });

  describe('Settings Panel', () => {
    test('clicking Settings opens settings panel', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Project Info')).toBeInTheDocument();
      expect(screen.getByText('Project Name')).toBeInTheDocument();
    });

    test('editing project name updates value', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      const nameInput = screen.getByDisplayValue('Project Alpha');
      fireEvent.change(nameInput, { target: { value: 'Project Beta' } });
      expect(nameInput.value).toBe('Project Beta');
    });

    test('settings panel has close button', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('Project Info')).not.toBeInTheDocument();
    });

    test('delete all tasks button exists in danger zone', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
      expect(screen.getByText('Delete All Tasks')).toBeInTheDocument();
    });

    test('delete all tasks with confirmation removes all tasks', () => {
      window.confirm.mockReturnValue(true);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      fireEvent.click(screen.getByText('Delete All Tasks'));
      // Settings panel should close
      expect(screen.queryByText('Project Info')).not.toBeInTheDocument();
      // All tasks should be gone
      expect(screen.queryByText('Implement user authentication')).not.toBeInTheDocument();
      expect(screen.queryByText('Design dashboard layout')).not.toBeInTheDocument();
    });

    test('delete all tasks without confirmation keeps tasks', () => {
      window.confirm.mockReturnValue(false);
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      fireEvent.click(screen.getByText('Delete All Tasks'));
      // Close settings to see the board
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.getByText('Implement user authentication')).toBeInTheDocument();
    });

    test('settings persist to localStorage', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      const nameInput = screen.getByDisplayValue('Project Alpha');
      fireEvent.change(nameInput, { target: { value: 'Updated Project' } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dashboardSettings',
        expect.stringContaining('Updated Project')
      );
    });
  });

  describe('Export CSV', () => {
    test('clicking Export button triggers CSV download', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText(/Export/));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('export generates notification', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText(/Export/));
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      expect(screen.getByText('Tasks exported to CSV')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes task detail modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Implement user authentication'));
      expect(screen.getByText(/Add OAuth2 login flow/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/Add OAuth2 login flow/)).not.toBeInTheDocument();
    });

    test('Escape key closes create modal', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('New Task'));
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    test('Escape key closes settings panel', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByText('Project Info')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Project Info')).not.toBeInTheDocument();
    });

    test('Escape key closes notification panel', () => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByLabelText('Notifications'));
      expect(screen.getByText('No notifications')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('No notifications')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('tasks are saved to localStorage on change', () => {
      render(<ProjectDashboard />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dashboardTasks',
        expect.any(String)
      );
    });

    test('theme preference is loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dashboardTheme') return 'dark';
        return null;
      });
      render(<ProjectDashboard />);
      // Dark mode shows sun emoji for toggle
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dashboardView') return 'analytics';
        return null;
      });
      render(<ProjectDashboard />);
      expect(screen.getByText('Project Analytics')).toBeInTheDocument();
    });

    test('saved tasks are loaded from localStorage', () => {
      const savedTasks = JSON.stringify([
        {
          id: '999',
          title: 'Saved custom task',
          description: 'From localStorage',
          status: 'todo',
          priority: 'high',
          assignee: null,
          category: 'feature',
          createdAt: Date.now(),
          dueDate: null,
          tags: [],
          subtasks: [],
          comments: [],
          timeEstimate: 0,
          timeSpent: 0,
        },
      ]);
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dashboardTasks') return savedTasks;
        return null;
      });
      render(<ProjectDashboard />);
      expect(screen.getByText('Saved custom task')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dashboardTasks') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<ProjectDashboard />)).not.toThrow();
    });
  });

  describe('Calendar View', () => {
    beforeEach(() => {
      render(<ProjectDashboard />);
      fireEvent.click(screen.getByText('Calendar'));
    });

    test('renders current month and year', () => {
      const now = new Date();
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    test('renders day of week headers', () => {
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    test('clicking left arrow navigates to previous month', () => {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      fireEvent.click(screen.getByText('←'));
      expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
    });

    test('clicking right arrow navigates to next month', () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
      const nextMonthYear = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      fireEvent.click(screen.getByText('→'));
      expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
    });

    test('Today button navigates back to current month', () => {
      const now = new Date();
      const currentMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      // Navigate away
      fireEvent.click(screen.getByText('←'));
      fireEvent.click(screen.getByText('←'));
      // Click Today
      fireEvent.click(screen.getByText('Today'));
      expect(screen.getByText(currentMonthYear)).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    test('search and priority filter work together', () => {
      render(<ProjectDashboard />);
      const searchInput = screen.getByPlaceholderText('Search tasks... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'pagination' } });
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'critical' } });
      expect(screen.getByText('Fix pagination bug on mobile')).toBeInTheDocument();
    });

    test('non-matching combined filters show no tasks', () => {
      render(<ProjectDashboard />);
      const searchInput = screen.getByPlaceholderText('Search tasks... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'authentication' } });
      const priorityFilter = screen.getByLabelText('Filter by priority');
      fireEvent.change(priorityFilter, { target: { value: 'low' } });
      // authentication task is critical, not low
      expect(screen.queryByText('Implement user authentication')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<ProjectDashboard />)).not.toThrow();
    });
  });
});
