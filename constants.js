// error messages
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

export const EXERCISES_ERROR = {
  DEFAULT_ERROR_MESSAGE: 'something went wrong',
  DESCRIPTION_REQUIRED: 'description property is required',
  DESCRIPTION_STRING: 'description should be string',
  DURATION_REQUIRED: 'duration property is required',
  DURATION_INTEGER: 'duration should be a positive integer',

  USERNAME_NOT_EXIST: 'user with the given ID does not exist',
  USERNAME_NOT_VALID: 'username is not valid: must not contain any special characters',
  USERNAME_SPACE_NOT_ALLOWED: 'username cannot contain any spaces',
  USERNAME_EMPTY: 'username cannot be empty',
  USERNAME_EXIST: 'username already exist',

  EXERCISE_CREATE: `cannot create exercise - user with given ID does not exist`,

  DATE_FORMAT: `invalid date format - must be ${DEFAULT_DATE_FORMAT}`,
  DATE_INVALID: 'invalid date: the provided date does not exist',

  DATE_FROM_INVALID: 'invalid search parameter ?from: invalid date',
  DATE_FROM_FORMAT: `invalid date format for ?from search parameter - must be ${DEFAULT_DATE_FORMAT}`,
  DATE_TO_INVALID: 'invalid search parameter ?to: invalid date',
  DATE_TO_FORMAT: `invalid date format for ?to search parameter - must be ${DEFAULT_DATE_FORMAT}`,

  PARAMETER_ID_REQUIRED: 'the _id query parameter is required',
  PARAMETER_ID_INTEGER: 'the _id query parameter should be a valid positive integer',

  PARAMETER_LIMIT_INTEGER: 'limit should be a valid positive integer',

  SQL_CONSTRAINT_ERROR: 'SQLITE_CONSTRAINT',

  BODY_EMPTY: 'empty request body',
  BODY_FORBIDDEN_PROPERTIES: 'forbidden properties provided',
  BODY_INCOMPLETE: 'Incomplete data: required properties missing'
}