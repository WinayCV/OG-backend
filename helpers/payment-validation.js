const paymentValidatioSchema = {
  amount: {
    notEmpty: {
      errorMessage: 'Amount cannot be empty',
    },
  },
};

module.exports = paymentValidatioSchema;
