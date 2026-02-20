import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { enemiesRouter } from './routes/enemies.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', enemiesRouter);

app.listen(PORT, () => {
  console.log(`Enemy forge server running on http://localhost:${PORT}`);
});
