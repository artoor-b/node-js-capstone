export const createErrorMessageLog = (error, message, location) => {
  console.error('###', location);
  console.error('error:', error);
  console.error('message:', message, '\n');
}