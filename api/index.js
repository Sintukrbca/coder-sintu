import express from "express";


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));



const app = express();


app.get("/", (req, res) => {
  res.send("Vercel server working ✅");
});

export default app;
