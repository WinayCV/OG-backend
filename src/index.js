require("dotenv").config();
const express = require("express");
const cors = require("cors");
const configDB = require("../config/db");
const { checkSchema } = require("express-validator");
const {
  userRegisterationSchema,
  userLoginSchema,
  userAdminSchema,
} = require("../helpers/user-Validation");
const artworkCltr = require("../controllers/artwork-cltr");
const userCltr = require("../controllers/user-cltr");
const {
  authenticateUser,
  authorizeUser,
} = require("../middlewares/authenticate");
const artworkValidationSchema = require("../helpers/artwork-validation");
const multer = require("multer");
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
configDB();
//multer configurataion

const upload = multer();

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
app.put(
  "/og/editUserPriviliges/:id",
  authenticateUser,
  authorizeUser(["admin"]),
  checkSchema(userAdminSchema),
  userCltr.role
);
app.delete("/og/deleteProfile");

//Artwork

app.post(
  "/og/artwork/create",
  authenticateUser,
  upload.array("files"),
  checkSchema(artworkValidationSchema),
  artworkCltr.create
);
app.get("/og/artwork/all", artworkCltr.all); //public
app.get(
  "/og/artwork/list",
  authenticateUser,
  authorizeUser(["artist"]),
  artworkCltr.list
); //artist
app.get("/og/artwork/:id");

//Connection to server
app.listen(port, () => {
  console.log("server running at ", port);
});
