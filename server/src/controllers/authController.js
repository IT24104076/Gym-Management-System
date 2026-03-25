const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const register = async (req, res) => {
  const { name, email, password, role, phone, address, dateOfBirth } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'Email already in use', 400);
  }

  const status = ['admin', 'manager'].includes(role) ? 'active' : 'pending';

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'member',
    status,
    phone,
    address,
    dateOfBirth,
  });

  await ActivityLog.create({
    userId: user._id,
    action: 'User registered',
    details: `New user registered with role: ${user.role}`,
    ipAddress: req.ip,
  });

  const token = user.generateAuthToken();

  return successResponse(
    res,
    {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    },
    'Registration successful',
    201
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  if (user.status === 'deactivated') {
    return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
  }

  if (user.status === 'suspended') {
    return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    userId: user._id,
    action: 'User logged in',
    details: 'Successful login',
    ipAddress: req.ip,
  });

  const token = user.generateAuthToken();

  return successResponse(res, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      phone: user.phone,
      membershipPlan: user.membershipPlan,
      membershipStart: user.membershipStart,
      membershipExpiry: user.membershipExpiry,
      lastLogin: user.lastLogin,
    },
  });
};

const logout = async (req, res) => {
  await ActivityLog.create({
    userId: req.user._id,
    action: 'User logged out',
    ipAddress: req.ip,
  });
  return successResponse(res, null, 'Logged out successfully');
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  return successResponse(res, { user });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return errorResponse(res, 'Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    action: 'Password changed',
    ipAddress: req.ip,
  });

  return successResponse(res, null, 'Password updated successfully');
};

module.exports = { register, login, logout, getMe, changePassword };
