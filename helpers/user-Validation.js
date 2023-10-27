const User = require("../models/user-model");
const usernameRegisterSchmea = {
  notEmpty: {
    errorMessage: "username cannot be empty",
  },
  isLength: {
    option: { min: 4 },
    errorMessage: "username should be minimum 4 charecter",
  },
  custom: {
    options: async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error(" username already in use.");
      } else {
        return true;
      }
    },
  },
};

const emailRegisterSchema = {
  notEmpty: {
    errorMessage: "email cannot be empty",
  },
  isEmail: {
    errorMessage: "Invalid email",
  },
  custom: {
    options: async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error(
          " Email already in use. Please use a different email or try logging in."
        );
      } else {
        return true;
      }
    },
  },
};

const emailLoginSchmea = {
  notEmpty: {
    errorMessage: "email cannot be empty",
  },
  isEmail: {
    errorMessage: "Invalid email",
  },
};

const passowrdSchmea = {
  notEmpty: {
    errorMessage: "email cannot be empty",
  },
  isLength: {
    options: { min: 8, max: 128 },
    errorMessage: "password should be minimun 8 - 128 charecters",
  },
};

const mobileSchema = {
  notEmpty: {
    errorMessage: "mobile number cannot be empty",
  },
  isLength: {
    options: { min: 10, max: 10 },
    errorMessage: "Invalid mobile number",
  },
};

const userRegisterationSchema = {
  firstName: usernameRegisterSchmea,
  password: passowrdSchmea,
  email: emailRegisterSchema,
  mobileNum: mobileSchema,
};
const userLoginSchema = {
  email: emailLoginSchmea,
  password: passowrdSchmea,
};

const userAdminSchema = {
  role: {
    notEmpty: {
      errorMessage: "role cannot be empty",
    },
  },
};

module.exports = { userRegisterationSchema, userLoginSchema, userAdminSchema };
