require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const filesRoutes = require('./routes/files');
const shareRoutes = require('./routes/share');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

// Authenticated APIs
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/share', shareRoutes);

// Public download
app.use('/', downloadRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });
