// App version constants
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Idea Room';

// In a real app, this would fetch from an API
export async function getLatestVersion(): Promise<string> {
  // Simulate API call - in production, this would check a releases endpoint
  return Promise.resolve('1.0.0');
}
