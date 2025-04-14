import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import allowedOrigin from './config/allowedOrigin.js';

const app = express();

import dotenv from "dotenv";
dotenv.config();

const corsOptions ={
  origin: allowedOrigin, 
  credentials:true,            
  optionSuccessStatus:200,
  sameSite:'none',
  secure:true,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
}

app.use(cors(corsOptions));

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

const server = app.listen(8080, () =>
  console.log(`Server started on 8080`)
); 