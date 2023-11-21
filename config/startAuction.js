const Artwork = require('../models/artwork-model');
const Auction = require('../models/auction-model');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log('a user connected');
    let token = socket.handshake.headers['my-custom-header'];
    token = token.split(' ')[1];
    user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(user.id);

    socket.on('join_auction', (data) => {
      console.log('User connected to room', data);
      socket.join(data);

      socket.on('send_bid', async (data) => {
        try {
          const artwork = await Artwork.findById(data.artworkId);
          if (artwork.currentBidAmount >= parseInt(data.bid.amount)) {
            socket.emit('error', {
              msg: 'Bid amount is less than current bid, please verify your bid amount',
            });
          } else {
            const userData = await User.findById(user.id);
            if (userData.credit < parseInt(data.bid.amount)) {
              socket.emit('error', {
                msg: 'You do not have enough credit to bid, please buy more credit',
              });
            } else {
              await Artwork.findOneAndUpdate(
                {_id: data.artworkId},
                {$set: {currentBidAmount: data.bid.amount}},
                {new: true, runValidators: true}
              );
              io.to(data.id).emit('receive_bid', data);
            }
          }
        } catch (error) {
          console.error('Error in bidding:', error);
          socket.emit('error', {
            msg: 'An error occurred while processing your bid',
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('user disconnected', data);
        socket.leave(data);
      });
    });
  });
};
