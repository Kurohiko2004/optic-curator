require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes.js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Main route
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server started on port ${PORT}`);
});
