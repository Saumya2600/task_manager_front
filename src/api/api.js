import { getAccessToken, refreshToken } from './auth';

// Helper function to make authenticated API requests
const fetchWithAuth = async (url, options = {}) => {
    let token = getAccessToken();

    if (!token) {
        console.error('No access token found');
        return null;
    }

    // Add the Authorization header with the token
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, options);

    // If the token is invalid or expired, try refreshing it
    if (response.status === 401) {
        const newToken = await refreshToken();

        if (newToken) {
            // Retry the request with the new token
            options.headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, options);
        } else {
            // Redirect to login if refresh fails
            window.location.href = '/login';
            return null;
        }
    }

    return response;
};

// Add a new task
export const addTask = async (taskData) => {
    try {
        const response = await fetchWithAuth('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to add task');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
};

// Fetch all tasks
export const fetchTasks = async () => {
    try {
        const response = await fetchWithAuth('/api/tasks');

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};