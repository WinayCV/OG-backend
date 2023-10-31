const auctionValidationSchema = {
  startingBid: {
    isEmpty: {
      errorMessage: "Enter starting bid",
    },
  },
  currentBid: {
    isEmpty: {
      errorMessage: "Current starting bid",
    },
  },
  auctionStart: {
    isEmpty: {
      errorMessage: "need an auction start date to begin",
    },
    isDate: {
      errorMessage: "date should be valid",
      format: "YYYY-MM-DD",
    },
    custom: {
      options: (value) => {
        const today = new Date();
        const year = today.getFullYear(),
          month = today.getMonth() + 1,
          day = today.getDate();
        if (new Date(value) < new Date(`${year}-${month}-${day}`)) {
          throw new Error("start date cannot be less today");
        } else {
          return true;
        }
      },
    },
  },
  auctionEnd: {
    isEmpty: {
      errorMessage: "Auction end date cannot be empty",
    },
    isDate: {
      errorMessage: "date should be valid",
      format: "YYYY-MM-DD",
    },
    custom: {
      options: (value, { req }) => {
        if (new Date(value) < new Date(req.body.auctionStart)) {
          throw new Error(
            "Auction end date cannot be less than the auction start date"
          );
        } else {
          return true;
        }
      },
    },
  },
};

module.exports = auctionValidationSchema;
