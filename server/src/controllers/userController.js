const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

// GET /api/users
// Admin only: Get paginated users with optional search and role filtering
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search || '';
    const role = req.query.role || '';

    const [users, total] = await Promise.all([
      UserModel.findAll({ search, role, page, limit }),
      UserModel.countAll({ search, role }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[userController.getUsers] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
    });
  }
};

// GET /api/users/:id
// Admin only: Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[userController.getUserById] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user.',
    });
  }
};

// POST /api/users
// Admin only: Create a new user
const createUser = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const trimmedUsername = username.trim().toLowerCase();
    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters long.',
      });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "admin" or "user".',
      });
    }

    // Check if username already exists
    const existing = await UserModel.findByUsername(trimmedUsername);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Username '${trimmedUsername}' already exists.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      username: trimmedUsername,
      password_hash: passwordHash,
      role,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (error) {
    console.error('[userController.createUser] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
    });
  }
};

// PUT /api/users/:id
// Admin only: Update an existing user
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { username, password, role } = req.body;
    const updateData = {};

    if (username !== undefined) {
      const trimmedUsername = username.trim().toLowerCase();
      if (trimmedUsername.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Username must be at least 3 characters long.',
        });
      }

      // If changing username, check uniqueness
      if (trimmedUsername !== existingUser.username) {
        const conflict = await UserModel.findByUsername(trimmedUsername);
        if (conflict) {
          return res.status(409).json({
            success: false,
            message: `Username '${trimmedUsername}' is already taken.`,
          });
        }
      }
      updateData.username = trimmedUsername;
    }

    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be either "admin" or "user".',
        });
      }
      updateData.role = role;
    }

    if (password) {
      if (password.length < 4) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 4 characters long.',
        });
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[userController.updateUser] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.',
    });
  }
};

// DELETE /api/users/:id
// Admin only: Delete user
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    // Safeguard: Prevent admin from deleting their own current account
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account while logged in.',
      });
    }

    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await UserModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `User '${existingUser.username}' deleted successfully.`,
      deletedId: id,
    });
  } catch (error) {
    console.error('[userController.deleteUser] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
