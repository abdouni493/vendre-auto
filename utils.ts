// Utility function to get the currently logged-in user's username
export const getLoggedInUserName = (): string | null => {
  return localStorage.getItem('autolux_user_name');
};

// Utility function to get the created_by value for database records
export const getCreatedByValue = (): string => {
  return getLoggedInUserName() || 'Unknown';
};
