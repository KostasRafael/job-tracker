// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status === 500) {
    console.error(err);  // full details, visible only in your terminal
    return res.status(500).json({ message: 'Something went wrong' });
  }

  res.status(status).json({ message: err.message });
}

export default errorHandler;