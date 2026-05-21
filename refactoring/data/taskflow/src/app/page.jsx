import { useState, useEffect, useRef } from 'react';

export default function TaskFlow() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const newTaskRef = useRef(null);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('taskflowTheme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  // Load tasks from API (mock)
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // Mock API call
      const response = await fetch('/api/tasks');
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      // Fallback to mock data
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
      setTasks(mockTasks);
    }
  };

  const addTask = async (taskData) => {
    try {
      // Mock API call
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      // Fallback to local state management
      const newTask = {
        id: Date.now().toString(),
        ...taskData,
        status: 'todo',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
      setShowAddModal(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Mock API call
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, ...updatedTask, updatedAt: Date.now() }
            : task
        )
      );
    } catch (error) {
      // Fallback to local state management
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: Date.now() }
            : task
        )
      );
    }
    setEditingTask(null);
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      // Mock API call
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      // Fallback to local state management
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const statusCycle = {
      todo: 'in_progress',
      in_progress: 'completed',
      completed: 'todo',
    };

    const newStatus = statusCycle[task.status] || 'todo';
    await updateTask(taskId, { status: newStatus });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const searchedTasks = filteredTasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const sortedTasks = [...searchedTasks].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'priority': {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      default:
        return 0;
    }
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('taskflowTheme', newTheme ? 'dark' : 'light');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Header */}
      <header
        className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">📋 TaskFlow</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`px-3 py-1 rounded ${currentView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setCurrentView('kanban')}
                  className={`px-3 py-1 rounded ${currentView === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Kanban
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Task
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div
          className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="all">All Tasks</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="created">Newest First</option>
                <option value="updated">Recently Updated</option>
                <option value="title">Title A-Z</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div
          className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
        >
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p
                className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                No tasks found.{' '}
                {filter !== 'all' ? 'Try changing the filter or ' : ''}Add your
                first task!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-6 hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through' : ''}`}
                        >
                          {task.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>

                      {task.description && (
                        <p
                          className={`mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👤 {task.assignee}</span>
                        <span>📅 {formatDate(task.createdAt)}</span>
                        {task.dueDate && (
                          <span>⏰ Due: {formatDate(task.dueDate)}</span>
                        )}
                        <span>✏️ Updated: {formatDate(task.updatedAt)}</span>
                      </div>

                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Change Status"
                      >
                        {task.status === 'todo'
                          ? '▶️'
                          : task.status === 'in_progress'
                            ? '✅'
                            : '🔄'}
                      </button>
                      <button
                        onClick={() => setEditingTask(task)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Edit Task"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Delete Task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md mx-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
          >
            <div
              className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h2 className="text-xl font-semibold">Add New Task</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  assignee: formData.get('assignee'),
                  tags:
                    formData
                      .get('tags')
                      ?.split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean) || [],
                };
                addTask(taskData);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  ref={newTaskRef}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assignee
                  </label>
                  <input
                    name="assignee"
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Assignee name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  name="tags"
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="work, urgent, frontend"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md mx-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
          >
            <div
              className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h2 className="text-xl font-semibold">Edit Task</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  assignee: formData.get('assignee'),
                  tags:
                    formData
                      .get('tags')
                      ?.split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean) || [],
                };
                updateTask(editingTask.id, updates);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  name="title"
                  defaultValue={editingTask.title}
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingTask.description}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTask.priority}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assignee
                  </label>
                  <input
                    name="assignee"
                    defaultValue={editingTask.assignee}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  name="tags"
                  defaultValue={editingTask.tags?.join(', ')}
                  className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Task
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
