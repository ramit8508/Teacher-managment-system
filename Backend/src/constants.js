export const DB_NAME = "teacher_management";

export const USER_ROLES = {
  TEACHER: "teacher",
  ADMIN: "admin",
  STUDENT: "student"
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const MESSAGES = {
  SUCCESS: "Operation successful",
  ERROR: "Something went wrong",
  VALIDATION_ERROR: "Validation error",
  UNAUTHORIZED: "Unauthorized access",
  NOT_FOUND: "Resource not found",
  USER_CREATED: "User created successfully",
  USER_LOGGED_IN: "User logged in successfully",
  USER_LOGGED_OUT: "User logged out successfully"
};
