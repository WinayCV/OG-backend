const addressValidationSchema = {
  address: {
    notEmpty: {
      errorMessage: "address cannot be empty",
    },
  },
};

module.exports = addressValidationSchema;
