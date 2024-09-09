import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRouter from './routes/users.restRouter.js';

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  const HTML_PATH = new URL('./views/index.html', import.meta.url).pathname;
  res.sendFile(HTML_PATH);
});

app.use('/api', userRouter);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
