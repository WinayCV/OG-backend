const orderValidationSchema = {
  buyer: {
    notEmpty: {
      errorMessage: 'buyer id cannot be empty',
    },
  },
  artwork: {
    notEmpty: {
      errorMessage: 'Artwork id cannot be empty',
    },
  },
  address: {
    notEmpty: {
      errorMessage: 'Address cannot be empty',
    },
  },
  payment: {
    notEmpty: {
      errorMessage: 'payment ID cannot be empty',
    },
  },
};

module.exports = orderValidationSchema;
