/** create Exercise table if not exists */
export const createExerciseTable = async (db) => await db.run('CREATE TABLE IF NOT EXISTS Exercises (exerciseId INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER REQUIRED, duration INTEGER, description TEXT, date TEXT)');

/** create Users table if not exists */
export const createUsersTable = async (db) => await db.run('CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE CHECK (username != ""))');
