require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// CORS configuration for both Express and Socket.IO
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "socket-id"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.IO only once
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Pass io instance to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on port ${PORT}`);
});