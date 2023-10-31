const auctionCltr = {};

auctionCltr.create = async (req, res) => {
  try {
    res.json(req.user.id);
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = auctionCltr;
