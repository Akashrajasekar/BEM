import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import nodemailer from "nodemailer";
import Department from "../models/departments.model.js";
import DeletedUser from "../models/deletedUser.model.js";

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Change if using another provider
  auth: {
    user: "blackcrowx3@gmail.com", // Replace with your email
    pass: "xggi ondw hakl kqom", // Use an app password for security
  },
});

function generatePassword() {
  var length = 8,
    charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&(){}[]",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export const newUser = async (req, res) => {
  try {
    const {
      name,
      email,
      access,
      role,
      department,
      department_id,
      organization_id,
      manager_id,
    } = req.body;

    // Validate required fields
    if (!name || !email || !access || !role || !department) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate password
    const plainPassword = generatePassword();
    console.log("Generated Password:", plainPassword);

    let passwordToStore;
    let isPasswordReset = false; // Default value

    // Check the database for isPasswordReset status
    const userInDb = await User.findOne({ email });
    if (userInDb && userInDb.isPasswordReset) {
      // If isPasswordReset is true, hash the password
      passwordToStore = await bcrypt.hash(plainPassword, 10);
    } else {
      // If isPasswordReset is false, store plain password as tempPassword
      passwordToStore = plainPassword;
      // Send email with credentials
      const mailOptions = {
        from: '"No Reply" <your-email@gmail.com>',
        to: email,
        subject: "Your Account Credentials",
        text: `Hello ${name},\n\nYour account has been created. Here are your credentials:\n\nEmail: ${email}\nPassword: ${plainPassword}\n\nPlease log in and change your password.\n\nBest,\nExpense Management Team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error.message);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    // Create new user object
    const newUser = new User({
      organization_id, // Include if needed
      name,
      email,
      access,
      role,
      department,
      department_id,
      manager_id, // Optional
      password: passwordToStore, // Store hashed or plain password based on condition
      isPasswordReset: false, // Default to false
    });

    // Check if department already exists
    let existingDepartment = await Department.findOne({ name: department });

    if (!existingDepartment) {
      // Create new department only if it doesn't exist
      const newDepartment = new Department({
        name: department,
      });
      existingDepartment = await newDepartment.save();
    }

    await newUser.save();

    const document = await Department.findOne(
      { name: newUser.department },
      "_id"
    );
    const updatedUser = await User.findOneAndUpdate(
      { _id: newUser._id },
      { $set: { department_id: document._id } },
      { new: true } // This option returns the updated document
    );

    // const user = await User.findOne({ name: newUser.name })
    // console.log(user);
    // Send response (excluding password for security)
    return res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Add this new function to user.controller.js
export const getDepartmentUsers = async (req, res) => {
  try {
    // Aggregate users by department
    const departmentUsers = await User.aggregate([
      {
        $group: {
          _id: "$department",
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              role: "$role",
              access: "$access",
            },
          },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by department name
      },
    ]);

    res.json(departmentUsers);
  } catch (error) {
    console.error("Error fetching department users:", error);
    res.status(500).json({
      message: "Error retrieving department users",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Move user to DeletedUser collection
    const deletedUser = new DeletedUser({
      organization_id: user.organization_id,
      name: user.name,
      email: user.email,
      access: user.access,
      role: user.role,
      department: user.department,
      manager_id: user.manager_id,
      password: user.password, // Retaining the password if needed
      isPasswordReset: user.isPasswordReset,
    });

    await deletedUser.save(); // Save to DeletedUser collection

    // Remove user from User collection
    await User.findByIdAndDelete(userId);

    return res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const departments = async (req, res) => {
  try {
    const uniqueDepartments = await User.distinct("department");
    res.json(uniqueDepartments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving departments", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { access, role, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { access, role, department },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
