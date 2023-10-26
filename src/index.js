require("dotenv").config();
const express = require("express");
const cors = require("cors");
const configDB = require("../config/db");
const { checkSchema } = require("express-validator");
const {
  userRegisterationSchema,
  userLoginSchema,
} = require("../helpers/user-Validation");
const artworkCltr = require("../controllers/artwork-cltr");
const userCltr = require("../controllers/user-cltr");
const { authenticateUser } = require("../middlewares/authenticate");
const artworkValidationSchema = require("../helpers/artwork-validation");
const multer = require("multer");
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
configDB();
//multer configurataion

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

//user

app.post(
  "/og/register",
  checkSchema(userRegisterationSchema),
  userCltr.register
);
app.get("/og/verifyEmail/:token", userCltr.verify);
app.post("/og/login", checkSchema(userLoginSchema), userCltr.login);
app.get("/og/getProfile", authenticateUser, userCltr.account);
app.put("/og/editProfile");
app.get("/og/allProfiles");
app.put("/og/editUserPriviliges");
app.delete("/og/deleteProfile");

//Artist

app.post(
  "/og/artwork/create",
  authenticateUser,
  upload.array("files"),
  checkSchema(artworkValidationSchema),
  artworkCltr.create
);
app.get("/og/artwork/:id");
app.get("/og/artwork/list");

//Connection to server
app.listen(port, () => {
  console.log("server running at ", port);
});
