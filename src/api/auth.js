// Save tokens to localStorage
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

// Get access token from localStorage
export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// Remove tokens from localStorage (logout)
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// Refresh the access token using the refresh token
export const refreshToken = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        console.error('No refresh token found');
        return null;
    }

    try {
        const response = await fetch('/api/refresh-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken); // Save the new tokens
        return data.accessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens(); // Clear tokens if refresh fails
        return null;
    }
};