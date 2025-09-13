import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentRegisterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password required"],
    },

    studentImage: {
      type: String, // from cloudinary
    },
  },
  { timestamps: true }
);

// password hashing using bcrypt
studentRegisterSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// verifying password
studentRegisterSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate accessToken and refreshToken using jwt
studentRegisterSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

studentRegisterSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const Register = mongoose.model("Register", studentRegisterSchema);
