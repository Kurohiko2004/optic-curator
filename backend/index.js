import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'PTIT VR API is running smoothly',
    version: '1.0.0'
  });
});

// Ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    timestamp: new Date().toISOString(),
    message: 'Pong!' 
  });
});

app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `----------------------------------`);
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server started on port ${PORT}`);
  console.log(`\x1b[36m%s\x1b[0m`, `📡 Ready for PTIT VR clients...`);
  console.log(`\x1b[36m%s\x1b[0m`, `----------------------------------`);
});
