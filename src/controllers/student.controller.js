import { Student } from "../models/studentRegister.model";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";

const registerStudent = asyncHandler(async (req, res) => {
  // get info from frontend.
  const { name, email, password } = req.body;
  // check empty or not.
  if (
    [name, email, password].some((field) => {
      field?.trim === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // check user exist or not.
  const existedStudent = await Student.findOne({
    $or: [{ name }, { email }],
  });

  if (existedStudent) {
    throw new ApiError(409, "Student already existed");
  }
  // check for image.
  const studentImageLocalPath = req.file?.studentImage[0].path;

  if (!studentImageLocalPath) {
    throw new ApiError(
      400,
      "Failed in fetching image or Student image is required."
    );
  }
  // upload image on cloudinary.
  const studentImageCloudinaryPath = await uploadFileOnCloudinary(
    studentImageLocalPath
  );

  if (!studentImageCloudinaryPath) {
    throw new ApiError(
      400,
      "Error while uploading image or Student image is required"
    );
  }

  //create student.
  const student = await Student.create({
    name: name.toLowerCase(),
    email,
    password,
    studentImage: studentImageCloudinaryPath.url,
  });

  //remove password, refreshtoken from response.
  const createdStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  if (!createdStudent) {
    throw new ApiError(
      500,
      "Something went wrong or Error while registering student"
    );
  }
  // give response.
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdStudent, "Student Registered Successfully")
    );
});

export { registerStudent };
