const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submissions");
const sendOTP = require('../utils/sendEmail');
 
// ── SEND OTP ──────────────────────────────────────────────
const sendOTPController = async (req, res) => {
  try {
    const { emailId } = req.body;
 
    if (!emailId) throw new Error("Email is required");
 
    // check if email already registered
    const existingUser = await User.findOne({ emailId });
    if (existingUser) throw new Error("Email already registered");
 
    // generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
 
    // store OTP in redis for 10 minutes
    await redisClient.set(`otp:${emailId}`, otp);
    await redisClient.expire(`otp:${emailId}`, 600);
 
    // send OTP email
    await sendOTP(emailId, otp);
 
    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
};
 
// ── VERIFY OTP + REGISTER ─────────────────────────────────
const verifyOTPAndRegister = async (req, res) => {
  try {
    const { firstName, emailId, password, otp } = req.body;
 
    if (!otp) throw new Error("OTP is required");
 
    // get OTP from redis
    const storedOTP = await redisClient.get(`otp:${emailId}`);
 
    if (!storedOTP) throw new Error("OTP expired. Please request a new one.");
    if (otp !== storedOTP) throw new Error("Invalid OTP. Please try again.");
 
    // OTP verified — create user
    validate({ firstName, emailId, password });
 
    const hashedPassword = await bcrypt.hash(password, 10);
 
    const user = await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: 'user',
    });
 
    // delete OTP from redis after successful registration
    await redisClient.del(`otp:${emailId}`);
 
    const token = jwt.sign(
      { _id: user._id, emailId, role: 'user' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );
 
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });
 
    res.status(201).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Registered Successfully"
    });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
};
 
// ── REGISTER (kept for admin use) ────────────────────────
const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
 
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'user';
 
    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: 'user' },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );
 
    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };
 
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });
 
    res.status(201).json({
      user: reply,
      message: "Loggin Successfully"
    });
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};
 
// ── LOGIN ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;
 
    if (!emailId) throw new Error("Invalid Credentials");
    if (!password) throw new Error("Invalid Credentials");
 
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");
 
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid Credentials");
 
    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };
 
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );
 
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });
 
    res.status(201).json({
      user: reply,
      message: "Loggin Successfully"
    });
  } catch (err) {
    res.status(401).send("Error: " + err);
  }
};
 
// ── LOGOUT ────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);
 
    await redisClient.set(`token:${token}`, 'Blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);
 
    res.cookie("token", null, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now())
    });
 
    res.send("Logged Out Successfully");
  } catch (err) {
    res.status(503).send("Error: " + err);
  }
};
 
// ── ADMIN REGISTER ────────────────────────────────────────
const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
 
    req.body.password = await bcrypt.hash(password, 10);
 
    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );
 
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000
    });
 
    res.status(201).send("User Registered Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};
 
// ── DELETE PROFILE ────────────────────────────────────────
const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
 
module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  sendOTPController,
  verifyOTPAndRegister
};