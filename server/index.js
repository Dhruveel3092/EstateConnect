import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import allowedOrigin from './config/allowedOrigin.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import verifyToken from "./middleware/authMiddleware.js";
import brokerRoutes from "./routes/broker.js";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import brokerRatingRoutes from "./routes/brokerRating.js";
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinListing", (listingId) => {
    socket.join(listingId);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Make io accessible to routes
app.set("io", io);

import dotenv from "dotenv";
dotenv.config();

const corsOptions ={
  origin: allowedOrigin, 
  credentials:true,            
  optionSuccessStatus:200,
  sameSite:'lax',
  secure:true,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/auth-check", verifyToken, (req, res) => {
  res.status(200).json({ isAuthenticated: true, user:req.user });
});

app.use('/auth', authRoutes);
app.use('/general',verifyToken,generalRoutes);
app.use('/broker',verifyToken,brokerRoutes);
app.use('/client',verifyToken,clientRoutes);
app.use('/rating',verifyToken,brokerRatingRoutes);

mongoose
  .connect( process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

server.listen(8080, () =>
  console.log(`Server started on 8080`)
); 