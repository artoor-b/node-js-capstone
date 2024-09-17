import { Database } from 'sqlite-async';
import { EXERCISES_ERROR } from '../constants.js';
import { createExerciseTable, createUsersTable } from './helpers/createTableSql.js';
import { validateDate } from './helpers/validateDate.js';
import { createErrorMessageLog } from './helpers/errorMessageTemplate.js';

const dateFormat = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const integerFormat = /^\d*$/;

export const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    if (id && +id % 1 !== 0) throw new Error('ID should be integer');

    const db = await Database.open('./test.db');
    await createUsersTable(db);

    let result;

    if (id) {
      result = await db.get('SELECT id, username FROM Users WHERE id=$id', { $id: id });
    } else {
      result = await db.all('SELECT * FROM Users ', []);
    }

    if (!result) throw new Error(EXERCISES_ERROR.USERNAME_NOT_EXIST);

    return res.status(200).json(result);
  } catch (error) {
    const { message } = error;

    if (message === EXERCISES_ERROR.USERNAME_NOT_EXIST) {
      createErrorMessageLog(404, message, '[[getOne]]');

      return res.status(404).json({ status: 404, message })
    }

    createErrorMessageLog(400, message, '[[getOne]]');

    return res.status(400).json({ status: 400, message: EXERCISES_ERROR.DEFAULT_ERROR_MESSAGE });
  }
}

export const createOne = async (req, res) => {
  const { username } = req.body;
  const usernamePattern = /^[a-zA-Z0-9]+$/;

  const requiredDataKeys = ['username'];
  const requestBodyKeys = Object.keys(req.body);

  try {
    if (!requestBodyKeys.length) throw new Error(EXERCISES_ERROR.BODY_EMPTY);
    if (!requestBodyKeys.every(key => requiredDataKeys.includes(key))) throw new Error(EXERCISES_ERROR.BODY_FORBIDDEN_PROPERTIES);
    if (!requiredDataKeys.every(requiredKey => requestBodyKeys.includes(requiredKey))) throw new Error(EXERCISES_ERROR.BODY_INCOMPLETE);

    if (!username.toString().trim()) throw new Error(EXERCISES_ERROR.USERNAME_EMPTY);
    if (username.toString().includes(" ")) throw new Error(EXERCISES_ERROR.USERNAME_SPACE_NOT_ALLOWED);

    const db = await Database.open('./test.db');
    await createUsersTable(db);

    if (!usernamePattern.test(username)) throw new Error(EXERCISES_ERROR.USERNAME_NOT_VALID)

    const response = await db.run('INSERT INTO Users (username) values ($username)', { $username: username });
    const record = await db.get('SELECT id, username FROM Users WHERE id=$id', { $id: response.lastID });

    return res.status(200).json({ ...record });
  } catch (error) {
    const { message } = error;
    createErrorMessageLog(400, message, '[[createOne]]');

    if (error.code === EXERCISES_ERROR.SQL_CONSTRAINT_ERROR && error.message.includes('UNIQUE')) {
      return res.status(409).json({ status: 409, message: EXERCISES_ERROR.USERNAME_EXIST });
    }

    return res.status(400).json({ status: 400, message });
  }
}

export const createExercise = async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date, ":_id": exId } = req.body;

  console.log(req.body)

  const requiredDataKeys = ['description', 'duration', 'date', ':_id'];

  const convertedDate = date ? new Date(date) : new Date();

  const userQuery = 'SELECT id, username FROM Users WHERE id=$id';
  const userQueryParams = { $id: _id };

  try {
    const db = await Database.open('./test.db');

    const userCheck = await db.get(userQuery, userQueryParams);
    if (!userCheck?.username) throw new Error(EXERCISES_ERROR.EXERCISE_CREATE);

    const requestBodyKeys = Object.keys(req.body);
    if (!requestBodyKeys.length) throw new Error(EXERCISES_ERROR.BODY_EMPTY);
    if (!requestBodyKeys.every(key => requiredDataKeys.includes(key))) throw new Error(EXERCISES_ERROR.BODY_FORBIDDEN_PROPERTIES);
    if (!requiredDataKeys.every(requiredKey => requestBodyKeys.includes(requiredKey))) throw new Error(EXERCISES_ERROR.BODY_INCOMPLETE);

    if (!_id) throw new Error(EXERCISES_ERROR.PARAMETER_ID_REQUIRED);
    if (!description) throw new Error(EXERCISES_ERROR.DESCRIPTION_REQUIRED);
    if (!duration) throw new Error(EXERCISES_ERROR.DURATION_REQUIRED);
    if (!dateFormat.test(date)) throw new Error(EXERCISES_ERROR.DATE_FORMAT);
    date && validateDate(convertedDate, EXERCISES_ERROR.DATE_INVALID);
    const formattedDate = convertedDate.toISOString().split('T')[0]; // YYYY-MM-DD

    if (+_id % 1 !== 0 || !integerFormat.test(_id)) throw new Error(EXERCISES_ERROR.PARAMETER_ID_INTEGER);
    if (+description) throw new Error(EXERCISES_ERROR.DESCRIPTION_STRING);
    if (+duration % 1 !== 0 || !integerFormat.test(duration)) throw new Error(EXERCISES_ERROR.DURATION_INTEGER);

    await createExerciseTable(db);

    const response = await db.run('INSERT INTO Exercises VALUES (null, $userId, $duration, $description, $date)', {
      $userId: _id,
      $duration: duration,
      $description: description,
      $date: formattedDate
    });

    const insertedExercise = await db.get('SELECT * FROM Exercises WHERE exerciseId = $id', { $id: response.lastID });

    return res.status(200).json(insertedExercise);

  } catch (error) {
    const { message } = error;

    createErrorMessageLog(400, message, '[[createExercise]]');

    res.status(400).json({ status: 400, message });
  }
}

export const getLogs = async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const fromDate = from && new Date(from);
  const toDate = to && new Date(to);

  try {
    if (from && !dateFormat.test(from)) throw new Error(EXERCISES_ERROR.DATE_FROM_FORMAT);
    if (to && !dateFormat.test(to)) throw new Error(EXERCISES_ERROR.DATE_TO_FORMAT);

    if (limit && (+limit % 1 !== 0 || !integerFormat.test(limit))) throw new Error(EXERCISES_ERROR.PARAMETER_LIMIT_INTEGER);

    from && validateDate(fromDate, EXERCISES_ERROR.DATE_FROM_INVALID);
    to && validateDate(toDate, EXERCISES_ERROR.DATE_TO_INVALID);

    const db = await Database.open('./test.db');

    await createExerciseTable(db);

    let mainQuery = 'SELECT * FROM Exercises WHERE Exercises.userId = $id';
    let counterQuery = 'SELECT count(*) as counter FROM Exercises WHERE userId = $id';
    let queryParams = { $id: _id };

    if (from) {
      const fromFilter = ' AND date >= $from'
      mainQuery += fromFilter;
      counterQuery += fromFilter;
      queryParams.$from = from;
    }

    if (to) {
      const toFilter = ' AND date <= $to';
      mainQuery += toFilter;
      counterQuery += toFilter;
      queryParams.$to = to;
    }

    mainQuery += ' ORDER BY Exercises.date ASC'; // sort by dates ascending
    if (limit) mainQuery += ` LIMIT ${limit}`

    // get filtered result
    const responseFiltered = await db.all(mainQuery, queryParams);
    const logsCounter = await db.get(counterQuery, queryParams);

    const exercisesProjection = responseFiltered.map(({ exerciseId, description, duration, date }) => ({
      id: exerciseId,
      description,
      duration,
      date
    }));

    const clientResponse = {
      logs: exercisesProjection,
      count: logsCounter.counter // counter of all user records in range
    };

    return res.status(200).json(clientResponse);
  } catch (error) {
    const { message } = error;
    createErrorMessageLog(400, message, '[[getLogs]]');

    res.status(400).json({ status: 400, message });
  }
};
