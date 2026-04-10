require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./middlewares/errorMiddleware.js');
const authRoutes = require('./routes/authRoutes.js');
const glassesRoutes = require('./routes/glassesRoutes.js');

const app = express();
const PORT = process.env.PORT || 8082;

const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Main route
app.use('/api/auth', authRoutes);
app.use('/api/glasses', glassesRoutes);

// Error handling middleware (MUST be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
