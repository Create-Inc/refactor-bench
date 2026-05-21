/**
 * Task API functions for TaskFlow application
 * These functions handle communication with the backend API
 */

// Mock API base URL
const API_BASE_URL = '/api';

/**
 * Fetch all tasks from the API
 * @returns {Promise<Array>} Array of task objects
 */
export async function fetchTasks() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task object
 */
export async function createTask(taskData) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update an existing task
 * @param {string} taskId - ID of the task to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated task object
 */
export async function updateTask(taskId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Get task statistics
 * @returns {Promise<Object>} Task statistics
 */
export async function getTaskStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching task stats:', error);
    throw error;
  }
}

/**
 * Search tasks
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered tasks
 */
export async function searchTasks(query) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tasks/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching tasks:', error);
    throw error;
  }
}

/**
 * Bulk update tasks
 * @param {Array<string>} taskIds - Array of task IDs to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Array>} Updated tasks
 */
export async function bulkUpdateTasks(taskIds, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskIds, updates }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    throw error;
  }
}
