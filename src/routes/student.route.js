import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/student.middleware.js";
import {
  registerStudent,
  loggedInStudent,
  loggedOutStudent,
} from "../controllers/student.controller.js";

const router = Router();

router.route("/regisetr").post(
  upload.fields([
    {
      name: "studentImage",
      maxCount: 1,
    },
  ]),
  registerStudent
);
router.route("/login").post(loggedInStudent);

//verified routes
router.route("/logout").get(verifyJwt, loggedOutStudent);
