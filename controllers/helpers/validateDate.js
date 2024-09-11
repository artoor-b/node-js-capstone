export const validateDate = (date, errorMessage) => {
  if (isNaN(date.getTime())) {
    throw new Error(errorMessage);
  }

  return true;
}