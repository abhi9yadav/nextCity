const AppError = require("../utils/appError");
const path = require("path");
const fs = require("fs");
const rootDir = require("../utils/rootDir");

// when id length is small or big
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

//DEV Mode Error
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Serve HTML with dynamic error message
    const htmlPath = path.join(rootDir, "views/error/error.html");
    let html = fs.readFileSync(htmlPath, "utf-8");
    html = html.replace("{{ERROR_MESSAGE}}", err.message || "Unknown error");
    res.status(err.statusCode || 500).send(html);
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  if (err.isOperational) {
    const htmlPath = path.join(rootDir, "views/error/error.html");
    let html = fs.readFileSync(htmlPath, "utf-8");
    html = html.replace(
      "{{ERROR_MESSAGE}}",
      err.message || "Something went wrong"
    );
    return res.status(err.statusCode || 500).send(html);
  }

  const htmlPath = path.join(rootDir, "views/error/error.html");
  let html = fs.readFileSync(htmlPath, "utf-8");
  html = html.replace("{{ERROR_MESSAGE}}", "Please try again later.");
  return res.status(err.statusCode || 500).send(html);
};

const handleFirebaseError = (err) => {
  if (err.code === "auth/invalid-id-token")
    return new AppError("Invalid Firebase token", 401);
  if (err.code === "auth/id-token-expired")
    return new AppError("Firebase token expired, login again", 401);
  return new AppError(err.message || "Firebase error", 500);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.code?.startsWith("auth/")) err = handleFirebaseError(err);

    sendErrorProd(err, req, res);
  }
};
