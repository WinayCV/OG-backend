require("dotenv").config();
const express = require("express");
const cors = require("cors");
const configDB = require("../config/db");
const { checkSchema } = require("express-validator");
const {
  userRegisterationSchema,
  userLoginSchema,
  userAdminSchema,
  userProfileEditSchmea,
} = require("../helpers/user-Validation");
const artworkCltr = require("../controllers/artwork-cltr");
const userCltr = require("../controllers/user-cltr");
const {
  authenticateUser,
  authorizeUser,
} = require("../middlewares/authenticate");
const {
  artworkValidationSchema,
  artworkEditSchema,
} = require("../helpers/artwork-validation");
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
app.put(
  "/og/editProfile",
  authenticateUser,
  checkSchema(userProfileEditSchmea),
  userCltr.edit
);
app.get("/og/allProfiles");
app.put(
  "/og/editUserPriviliges/:id",
  authenticateUser,
  authorizeUser(["admin"]),
  checkSchema(userAdminSchema),
  userCltr.role
);
app.delete("/og/deleteProfile");

//Artwork- //public
app.get("/og/artwork/all", artworkCltr.all);
app.get("/og/artwork/:id", artworkCltr.one);

//Artwork- //Artist
app.post(
  "/og/artwork/create",
  authenticateUser,
  authorizeUser(["artist"]),
  upload.array("files"),
  checkSchema(artworkValidationSchema),
  artworkCltr.create
);
app.get(
  "/og/artwork/list",
  authenticateUser,
  authorizeUser(["artist"]),
  artworkCltr.list
);
app.put(
  "/og/artwork/edit/:id",
  authenticateUser,
  authorizeUser(["artist"]),
  upload.array("newImages"),
  checkSchema(artworkEditSchema),
  artworkCltr.edit
); // sending artwork id
app.delete(
  "/og/artwork/delete/:id",
  authenticateUser,
  authorizeUser(["artist", "admin"]),
  artworkCltr.delete
);

//Connection to server
app.listen(port, () => {
  console.log("server running at ", port);
});
