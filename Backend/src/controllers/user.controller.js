import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password, role, phone, address, subject, classId, className, rollNo, fatherName, motherName } = req.body;

  // Validation
  if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Get createdBy from the logged-in user (if exists)
  const createdBy = req.user?._id || null;
  
  // DEBUG: Log to see if req.user is being set
  console.log('🔍 Register User Debug:');
  console.log('  - req.user exists?', !!req.user);
  console.log('  - req.user._id:', req.user?._id);
  console.log('  - createdBy will be set to:', createdBy);
  console.log('  - User being added:', fullName);

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    role: role || "teacher",
    phone: phone || "",
    address: address || "",
    subject: subject || "",
    classId: classId || null,
    className: className ? className.trim().toUpperCase() : "", // Normalize to uppercase (1a -> 1A)
    rollNo: rollNo || "",
    fatherName: fatherName || "",
    motherName: motherName || "",
    createdBy: createdBy
  });

  // Remove password and refreshToken from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if user is blocked
  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked. Please contact the administrator.");
  }

  // Prevent students from logging in to the management system
  if (user.role === "student") {
    throw new ApiError(403, "Students cannot login to the management system. Only teachers and admins are allowed.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  
  let query = {};
  if (role) query.role = role;
  
  // ONLY filter for teachers, admins see ALL students
  if (req.user && req.user.role === 'teacher' && role === 'student') {
    const { ClassAssignment } = await import("../models/classAssignment.model.js");
    
    // Find classes assigned to this teacher
    const assignments = await ClassAssignment.find({ 
      assignedTeachers: req.user._id 
    }).select('className');
    
    const assignedClassNames = assignments.map(a => a.className);
    
    console.log('🔒 Teacher:', req.user.fullName, 'assigned to classes:', assignedClassNames);
    
    // Filter students: either created by this teacher OR in assigned classes
    query.$and = [
      { role: 'student' },
      {
        $or: [
          { createdBy: req.user._id },
          { className: { $in: assignedClassNames } }
        ]
      }
    ];
  }
  
  if (search) {
    if (!query.$and) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    } else {
      query.$and.push({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      });
    }
  }

  const users = await User.find(query)
    .select("-password -refreshToken")
    .populate('classId', 'name subject teacher');
  
  console.log('📋 Students found:', users.length);

  return res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, username, role, isBlocked, phone, address, subject, classId, className, currentPassword, newPassword } = req.body;

  // Find the user first
  const user = await User.findById(id);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle password change separately
  if (currentPassword && newPassword) {
    // Verify current password
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    
    if (!isPasswordValid) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, { message: "Password changed successfully" }, "Password updated successfully")
    );
  }

  // Handle regular profile updates
  const updateData = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (email !== undefined) updateData.email = email;
  if (username !== undefined) updateData.username = username;
  if (role !== undefined) updateData.role = role;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (subject !== undefined) updateData.subject = subject;
  
  // Handle classId and className (allow null values to clear them)
  if (classId !== undefined) updateData.classId = classId;
  if (className !== undefined) updateData.className = className ? className.trim().toUpperCase() : ""; // Normalize to uppercase

  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .select("-password -refreshToken")
    .populate('classId', 'name subject teacher');

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User updated successfully")
  );
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "User deleted successfully")
  );
});

const bulkRegisterUsers = asyncHandler(async (req, res) => {
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "Students array is required");
  }

  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    try {
      // Validate required fields
      if (!student.email || !student.fullName || !student.password) {
        results.failed++;
        results.errors.push({
          index: i + 1,
          email: student.email || 'N/A',
          error: 'Missing required fields (email, fullName, password)'
        });
        continue;
      }

      // Auto-generate username if not provided
      if (!student.username) {
        student.username = student.email.split('@')[0].toLowerCase();
      }

      // Check if user already exists
      const existedUser = await User.findOne({
        $or: [{ username: student.username }, { email: student.email }]
      });

      if (existedUser) {
        results.failed++;
        results.errors.push({
          index: i + 1,
          email: student.email,
          error: 'User already exists'
        });
        continue;
      }

      // Create user
      await User.create({
        username: student.username.toLowerCase(),
        email: student.email,
        fullName: student.fullName,
        password: student.password,
        role: student.role || 'student',
        phone: student.phone || '',
        address: student.address || '',
        className: student.className ? student.className.trim().toUpperCase() : '', // Normalize to uppercase
        classId: student.classId || null,
        rollNo: student.rollNo || '',
        fatherName: student.fatherName || '',
        motherName: student.motherName || '',
        createdBy: req.user?._id || null
      });

      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        index: i + 1,
        email: student.email || 'N/A',
        error: error.message
      });
    }
  }

  return res.status(201).json(
    new ApiResponse(201, results, `Bulk registration completed: ${results.successful} successful, ${results.failed} failed`)
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkRegisterUsers
};
