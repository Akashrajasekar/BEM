import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Extract token from headers
        if (!token) {
            return res.status(401).json({ message: 'Access Denied. No token provided.' });
        }

        const decoded = jwt.verify(token, SECRET_KEY); // Verify token
        req.user = { id: decoded.id, organization_id: decoded.organization_id, department_id: decoded.department_id, department: decoded.department }; // Attach user data
        next(); // Proceed to next middleware
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const getUsersByDepartment = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $group: {
          _id: "$department",
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              role: "$role",
              email: "$email",
              Alloted_Limit: "$Alloted_Limit",
            },
          },
        },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Set budget limit for user
export const setUserLimit = async (req, res) => {
  const { userId, category, budget } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { Alloted_Limit: budget },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user limit", error: error.message });
  }
};
