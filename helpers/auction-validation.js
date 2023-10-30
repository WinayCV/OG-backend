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
  },
  auctionEnd: {
    isEmpty: {
      errorMessage: "Auction end date cannot be empty",
    },
  },
};

module.exports = auctionValidationSchema;
