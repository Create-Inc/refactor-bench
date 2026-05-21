/**
 * Utility functions for TaskFlow application
 */

/**
 * Format a timestamp into a human-readable string
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted time string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return 'Yesterday';

  return date.toLocaleDateString();
}

/**
 * Get CSS classes for task status
 * @param {string} status - Task status
 * @returns {string} CSS classes
 */
export function getStatusColor(status) {
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
}

/**
 * Get CSS classes for task priority
 * @param {string} priority - Task priority
 * @returns {string} CSS classes
 */
export function getPriorityColor(priority) {
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
}

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate task data
 * @param {Object} taskData - Task data to validate
 * @returns {Object} Validation result with errors
 */
export function validateTaskData(taskData) {
  const errors = {};

  if (!taskData.title || taskData.title.trim().length < 1) {
    errors.title = 'Title is required';
  }

  if (taskData.title && taskData.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (taskData.description && taskData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  if (taskData.assignee && taskData.assignee.length > 50) {
    errors.assignee = 'Assignee name must be less than 50 characters';
  }

  if (taskData.tags) {
    const tags = Array.isArray(taskData.tags)
      ? taskData.tags
      : taskData.tags.split(',').map((tag) => tag.trim());
    if (tags.some((tag) => tag.length > 20)) {
      errors.tags = 'Each tag must be less than 20 characters';
    }
    if (tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generate a unique ID for tasks
 * @returns {string} Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sort tasks based on criteria
 * @param {Array} tasks - Array of tasks to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted tasks
 */
export function sortTasks(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
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
}

/**
 * Filter tasks based on criteria
 * @param {Array} tasks - Array of tasks to filter
 * @param {string} filter - Filter criteria
 * @param {string} searchQuery - Search query
 * @returns {Array} Filtered tasks
 */
export function filterTasks(tasks, filter, searchQuery = '') {
  let filtered = tasks;

  // Apply status filter
  if (filter !== 'all') {
    filtered = filtered.filter((task) => task.status === filter);
  }

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}
