import { Database } from 'sqlite-async';
import { EXERCISES_ERROR } from '../constants.js';
import { createExerciseTable, createUsersTable } from './helpers/createTableSql.js';

export const getOne = async (req, res) => {
  const { id } = req.query;

  try {
    const db = await Database.open('../test.db');
    await createUsersTable(db);

    let result;

    if (id) {
      result = await db.get('SELECT id, username FROM Users WHERE id=$id', { $id: id });
    } else {
      result = await db.all('SELECT * FROM Users ', []);
    }

    if (!result) return res.status(404).json({ status: 404, message: EXERCISES_ERROR.USERNAME_NOT_EXIST });

    return res.status(200).json(result);
  } catch {
    return res.status(400).json({ status: 400, message: EXERCISES_ERROR.DEFAULT_ERROR_MESSAGE });
  }
}

export const createOne = async (req, res) => {
  const { username } = req.body;

  try {
    const db = await Database.open('../test.db');
    await createUsersTable(db);

    if (!username) throw new Error('EMPTY_STRING');

    const response = await db.run('INSERT INTO Users (username) values ($username)', { $username: username });
    const record = await db.get('SELECT id, username FROM Users WHERE id=$id', { $id: response.lastID });

    return res.status(200).json({ ...record });
  } catch (error) {
    console.log(error)
    if (error.message === 'EMPTY_STRING') {
      return res.status(400).json({ status: 400, message: EXERCISES_ERROR.USERNAME_EMPTY_STRING });
    }

    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE')) {
      return res.status(400).json({ status: 400, message: EXERCISES_ERROR.USERNAME_EXIST });
    }

    return res.status(400).json({ status: 400, message: EXERCISES_ERROR.DEFAULT_ERROR_MESSAGE });
  }
}

export const createExercise = async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  try {
    const exDate = !date ? new Date() : new Date(date);
    const formattedDate = exDate.toISOString().split('T')[0]; // YYY-MM-DD

    if (!description) throw new Error(EXERCISES_ERROR.DESCRIPTION_REQUIRED);
    if (+description) throw new Error(EXERCISES_ERROR.DESCRIPTION_STRING);
    if (!duration) throw new Error(EXERCISES_ERROR.DURATION_REQUIRED);
    if (+duration % 1 !== 0) throw new Error(EXERCISES_ERROR.DURATION_INTEGER);

    const db = await Database.open('../test.db');

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
    console.error(message);
    res.status(400).json({ status: 400, message });
  }
}

export const getLogs = async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  console.log(from, to, limit)

  try {
    const db = await Database.open('../test.db');

    await createExerciseTable(db);

    let query = 'SELECT * FROM Exercises WHERE Exercises.userId = $id';
    let queryParams = { $id: _id };

    // get all possible records for specific user
    const responseAll = await db.all(query, queryParams);

    if (from) {
      console.log('from', from)
      query += ' AND date >= $from';
      queryParams.$from = from;
    }

    if (to) {
      query += ' AND date <= $to';
      queryParams.$to = to;
    }

    if (limit) {
      query += ' LIMIT $limit';
      queryParams.$limit = parseInt(limit);
    }

    // get filtered result
    const responseFiltered = await db.all(query, queryParams);

    const exercisesProjection = responseFiltered.map(({ exerciseId, description, duration, date }) => ({
      id: exerciseId,
      description,
      duration,
      date
    }));

    const clientResponse = {
      logs: exercisesProjection,
      count: responseAll.length // store counter of all user records
    };

    return res.status(200).json(clientResponse);
  } catch (error) {
    const { message } = error;
    res.status(400).json({ status: 400, message });
  }
};
