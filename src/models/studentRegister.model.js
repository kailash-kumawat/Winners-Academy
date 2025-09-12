import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const studentRegisterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
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

export const Register = mongoose.model("Register", studentRegisterSchema);
