// departments.controller.js

import Department from "../models/departments.model.js";
import User from "../models/user.model.js";

export const getDepartmentsList = async (req, res) => {
  try {
    const departments = await Department.find().select("name");
    res.json(departments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching departments", error: error.message });
  }
};

export const getDepartmentManagers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const managers = await User.find({
      department_id: departmentId,
      access: "manager",
    }).select("name _id");
    res.json(managers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching managers", error: error.message });
  }
};

export const updateDepartmentBudget = async (req, res) => {
  try {
    const { department_id, manager_id, total_budget } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      department_id,
      {
        manager_id,
        total_budget,
      },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({
      message: "Error updating department budget",
      error: error.message,
    });
  }
};
