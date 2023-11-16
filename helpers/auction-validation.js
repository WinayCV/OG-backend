const auctionValidationSchema = {
  // startingBid: {
  //   notEmpty: {
  //     errorMessage: "Enter starting bid",
  //   },
  // },
  // currentBid: {
  //   isEmpty: {
  //     errorMessage: "Current starting bid",
  //   },
  // },
  auctionStart: {
    notEmpty: {
      errorMessage: 'need an auction start date to begin',
      bail: true,
    },

    isISO8601: {
      errorMessage: 'Invalid Date and Time.',
      bail: true,
    },
    custom: {
      options: (value) => {
        if (new Date(value) < new Date()) {
          throw new Error('start date cannot be less today');
        } else {
          return true;
        }
      },
    },
  },
  auctionEnd: {
    notEmpty: {
      errorMessage: 'Auction end date cannot be empty',
      bail: true,
    },
    isISO8601: {
      errorMessage: 'Invalid Date and Time.',
      bail: true,
    },
    custom: {
      options: (value, {req}) => {
        if (new Date(value) <= new Date(req.body.auctionStart)) {
          throw new Error(
            'Auction end date cannot be less than the auction start date'
          );
        } else {
          return true;
        }
      },
    },
  },
  auctionType: {
    notEmpty: {
      errorMessage: 'cannot be empty',
      bail: true,
    },
  },
};

const bidSchemaValidation = {
  amount: {
    notEmpty: {
      errorMessage: 'Amount cannot be empty',
    },
  },
};
module.exports = {auctionValidationSchema, bidSchemaValidation};
