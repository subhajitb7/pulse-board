require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Pass io to routes if needed
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-poll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`Socket ${socket.id} joined poll room: poll_${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Trigger restart
