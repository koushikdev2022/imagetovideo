const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const load = require("../route/load");

const app = express();

require("dotenv").config();

const port = process.env.PORT || 3015;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));
app.use(express.urlencoded({ limit: "400mb", extended: false }));
app.use(express.json({ limit: "400mb" }));


app.use("/", load);

// app.use((req, res) => res.status(404).json({
//     status_code: 404,
//     message: "Content not found.!"
// }));

module.exports = { app, port };
