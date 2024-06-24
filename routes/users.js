import express from "express";

import { getUserFeedToken } from "../services/users.js";
import { User, validateUser } from "../models/user.js";
import auth from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post("/", validate(validateUser), async (req, res) => {
  const { avatar, email, name } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.send(user);

  user = new User({ avatar, email, name });
  user.feedToken = getUserFeedToken(user._id);
  await user.save();

  res.status(201).send(user);
});

router.get("/", async (_req, res) => {
  const users = await User.find({});

  res.send(users);
});

router.get("/feedToken", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).send({ error: "User doesn't exist" });

  const feedToken = getUserFeedToken(user._id);
  user.feedToken = feedToken;
  await user.save();

  res.send(feedToken);
});

router.patch("/", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  if (!user)
    return res.status(404).send({ error: "User don't exist in the database" });

  res.send(user);
});

export default router;
