// write code for verifyjwt to verify user is logged in or not.
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { Student } from "../models/studentRegister.model.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization").replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized student");
    }

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const student = await Student.find(decodedToken._id);

    if (!student) {
      throw new ApiError(401, "Invalid access token");
    }

    req.student = student;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized student");
  }
});

export { verifyJwt };
