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

const generateAccessTokenAndRefreshToken = async (studentId) => {
  try {
    const student = await Student.findById(studentId);

    const accessToken = student.generateAccessToken();
    const refreshToken = student.generateRefreshToken();

    student.refreshToken = refreshToken;
    student.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wring while generating Access Token and Refresh Token"
    );
  }
};

const loggedInStudent = asyncHandler(async (req, res) => {
  // extract email, pass from frontend
  const { name, email, password } = req.body;
  // check email, pass is not empty.
  if (!(email && password && name)) {
    throw new ApiError(400, "All fields are required");
  }

  // find user
  const student = await Student.findOne({
    $or: [{ email }, { name }],
  });
  // check if user exist or not.
  if (!student) {
    throw new ApiError(401, "Student does not exist");
  }

  // check for password is correct or not.
  const isPasswordValid = await student.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Enter correct password");
  }

  //generate tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(student._id);

  const loggedInStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  // send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  // login successfully.
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { student: loggedInStudent, accessToken, refreshToken },
        "Student loggedIn successfully"
      )
    );
});

const loggedOutStudent = asyncHandler(async (req, res) => {
  // userfind
  // remove accesstoken
  await Student.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );
  // cookies delete
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Student logged out successfully"));
});

export { registerStudent, loggedInStudent, loggedOutStudent };
