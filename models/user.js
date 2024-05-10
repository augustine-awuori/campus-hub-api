import mongoose from "mongoose";
import Joi from "joi";

export const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      default: function () {
        return this._id.getTimestamp();
      },
    },
  })
);

export const validateUser = (user) =>
  Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
  }).validate(user);
