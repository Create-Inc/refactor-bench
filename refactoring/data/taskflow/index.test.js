import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskFlow from '.app/page.jsx';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock confirm dialog
global.confirm = vi.fn();

// Mock the API response
const mockTasks = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Write detailed proposal for Q1 project',
    status: 'in_progress',
    priority: 'high',
    assignee: 'John Doe',
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 5,
    tags: ['work', 'urgent'],
    dueDate: Date.now() + 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: '2',
    title: 'Review design mockups',
    description: 'Check the latest UI designs from the design team',
    status: 'todo',
    priority: 'medium',
    assignee: 'Jane Smith',
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60,
    tags: ['design', 'review'],
    dueDate: Date.now() + 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Update API documentation with latest changes',
    status: 'completed',
    priority: 'low',
    assignee: 'Mike Johnson',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    tags: ['docs', 'api'],
    dueDate: Date.now() + 1000 * 60 * 60 * 24 * 5,
  },
];

describe('TaskFlow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockTasks,
    });
    global.confirm.mockReturnValue(true);
  });

  describe('Component Rendering', () => {
    test('renders the TaskFlow header correctly', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('📋 TaskFlow')).toBeInTheDocument();
      });
    });

    test('renders the add task button', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('+ Add Task')).toBeInTheDocument();
      });
    });

    test('renders task list with mock data', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(
          screen.getByText('Complete project proposal')
        ).toBeInTheDocument();
        expect(screen.getByText('Review design mockups')).toBeInTheDocument();
        expect(screen.getByText('Update documentation')).toBeInTheDocument();
      });
    });

    test('displays task status badges correctly', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
        expect(screen.getByText('TODO')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      });
    });

    test('displays task priority badges correctly', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    test('opens add task modal when clicking add button', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add Task');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Add New Task')).toBeInTheDocument();
      });
    });

    test('can search tasks', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...');
        fireEvent.change(searchInput, { target: { value: 'project' } });
      });

      await waitFor(() => {
        expect(
          screen.getByText('Complete project proposal')
        ).toBeInTheDocument();
        expect(
          screen.queryByText('Review design mockups')
        ).not.toBeInTheDocument();
      });
    });

    test('can filter tasks by status', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('All Tasks');
        fireEvent.change(filterSelect, { target: { value: 'todo' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Review design mockups')).toBeInTheDocument();
        expect(
          screen.queryByText('Complete project proposal')
        ).not.toBeInTheDocument();
      });
    });

    test('can toggle task status', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const statusButtons = screen.getAllByTitle('Change Status');
        fireEvent.click(statusButtons[0]);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tasks/1',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });

    test('can delete task after confirmation', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete Task');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this task?'
        );
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tasks/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('Theme Management', () => {
    test('toggles between light and dark themes', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const themeButton = screen.getByText('🌙');
        fireEvent.click(themeButton);
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'taskflowTheme',
          'dark'
        );
      });
    });

    test('loads theme preference from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark');

      render(<TaskFlow />);

      await waitFor(() => {
        const container = screen
          .getByText('📋 TaskFlow')
          .closest('[class*="bg-gray-900"]');
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('📋 TaskFlow')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText('Complete project proposal')
        ).toBeInTheDocument();
      });
    });

    test('does not delete task when user cancels confirmation', async () => {
      global.confirm.mockReturnValue(false);

      render(<TaskFlow />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete Task');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this task?'
        );
        expect(global.fetch).not.toHaveBeenCalledWith(
          '/api/tasks/1',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('Form Functionality', () => {
    test('can submit add task form', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add Task');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Enter task title');
        const descInput = screen.getByPlaceholderText('Enter task description');
        const submitButton = screen.getByText('Add Task');

        fireEvent.change(titleInput, { target: { value: 'New Test Task' } });
        fireEvent.change(descInput, { target: { value: 'Test description' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tasks',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    test('validates required fields', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const addButton = screen.getByText('+ Add Task');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const submitButton = screen.getByText('Add Task');
        fireEvent.click(submitButton);
      });

      expect(global.fetch).not.toHaveBeenCalledWith(
        '/api/tasks',
        expect.anything()
      );
    });
  });

  describe('Task Display', () => {
    test('shows task metadata correctly', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('👤 John Doe')).toBeInTheDocument();
        expect(screen.getByText('👤 Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('#work')).toBeInTheDocument();
        expect(screen.getByText('#urgent')).toBeInTheDocument();
        expect(screen.getByText('#design')).toBeInTheDocument();
      });
    });

    test('shows task descriptions when present', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        expect(
          screen.getByText('Write detailed proposal for Q1 project')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Check the latest UI designs from the design team')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Update API documentation with latest changes')
        ).toBeInTheDocument();
      });
    });

    test('handles tasks without descriptions', async () => {
      const tasksWithoutDescriptions = [
        {
          id: '4',
          title: 'Simple task',
          status: 'todo',
          priority: 'low',
          assignee: 'Test User',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: [],
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => tasksWithoutDescriptions,
      });

      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('Simple task')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter Integration', () => {
    test('search works across multiple task fields', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...');
        fireEvent.change(searchInput, { target: { value: 'project' } });
      });

      await waitFor(() => {
        expect(
          screen.getByText('Complete project proposal')
        ).toBeInTheDocument();
        expect(
          screen.queryByText('Review design mockups')
        ).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search tasks...');
        fireEvent.change(searchInput, { target: { value: 'API' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Update documentation')).toBeInTheDocument();
        expect(
          screen.queryByText('Complete project proposal')
        ).not.toBeInTheDocument();
      });
    });

    test('filter and search work together', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const filterSelect = screen.getByDisplayValue('All Tasks');
        fireEvent.change(filterSelect, { target: { value: 'completed' } });

        const searchInput = screen.getByPlaceholderText('Search tasks...');
        fireEvent.change(searchInput, { target: { value: 'documentation' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Update documentation')).toBeInTheDocument();
        expect(
          screen.queryByText('Complete project proposal')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Review design mockups')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders responsive layout', async () => {
      render(<TaskFlow />);

      await waitFor(() => {
        const container = screen.getByText('📋 TaskFlow').closest('div');
        expect(container).toBeInTheDocument();
      });
    });

    test('handles different screen sizes', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TaskFlow />);

      await waitFor(() => {
        expect(screen.getByText('📋 TaskFlow')).toBeInTheDocument();
      });
    });
  });
});
