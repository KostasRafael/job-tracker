import mongoose from 'mongoose';
import HttpError from '../utils/HttpError.js';

export default function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new HttpError(400, 'Invalid id');
  }
  next();
}
