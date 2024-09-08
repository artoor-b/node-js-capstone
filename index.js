import express, { response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from 'sqlite-async';
dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  const HTML_PATH = new URL('./views/index.html', import.meta.url).pathname;
  res.sendFile(HTML_PATH);
});

app.get('/api/users', (req, res) => {
  const { id } = req.query;
  Database.open('test.db')
    .then(db => {
      if (id) {
        return db.get('SELECT id, username FROM Users WHERE id=$id', { $id: id });
      } else {
        return db.all('SELECT * FROM Users ', []);
      }
    })
    .then(result => res.status(200).json(result))
    .catch(() => res.status(400).json('ERROR'))
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  Database.open('test.db')
    .then(db => {
      return db.run('INSERT INTO Users (username) values ($username)', { $username: username })
        .then(response => ({ response, db }))
        .catch(() => res.status(400).json({ status: 400, message: 'username already exist' }))
    })
    .then(({ response, db }) => {
      const record = db.get('SELECT id, username FROM Users WHERE id=$id', { $id: response.lastID });
      return record;
    })
    .then(record => {
      res.status(200).json({ status: 200, record });
    })
    .catch(err => {
      console.log(err)
      res.status(400).json({ status: 400, message: 'something went wrong' });
    })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
