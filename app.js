const express = require("express");
const morgan = require("morgan");
const userRouter = require("./routes/userRoutes");
const audioRouter = require("./routes/audioRoutes");
const cors = require("cors");

const app = express();
//middlewares

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/audios", audioRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `can't find ${req.originalUrl} on this server!`,
  });
});
module.exports = app;
