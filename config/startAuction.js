const Artwork = require('../models/artwork-model');
const Auction = require('../models/auction-model');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const {CloudHSM} = require('aws-sdk');

module.exports = function (io) {
  io.on('connection', (socket) => {
    console.log(`${socket.id} user connected`);
    let token = socket.handshake.headers['my-custom-header'];
    token = token.split(' ')[1];
    user = jwt.verify(token, process.env.JWT_SECRET);
    let credictedUser = {};
    socket.on('join_auction', (data) => {
      console.log('User connected to room', data);
      socket.join(data);

      socket.on('send_bid', async (data) => {
        try {
          const artwork = await Artwork.findById(data.artworkId);
          if (
            artwork?.currentBidAmount >= parseInt(data.bid.amount)
          ) {
            socket.emit('error', {
              msg: 'Bid amount is less than current bid, please verify your bid amount',
            });
          } else {
            const userData = await User.findById(data.userId);
            if (userData.credit < parseInt(data.bid.amount)) {
              socket.emit('error', {
                msg: 'You do not have enough credit to bid, please buy more credit',
              });
            } else {
              // updating current bid in artwork
              await Artwork.findOneAndUpdate(
                {_id: data.artworkId},
                {$set: {currentBidAmount: data.bid.amount}},
                {new: true, runValidators: true}
              );
              // updating bids inside suction
              const auction = await Auction.findOneAndUpdate(
                {
                  artworks: {$in: [data.artworkId]},
                },
                {
                  $push: {
                    bids: {
                      user: data.userId,
                      amount: data.bid.amount,
                      artwork: data.artworkId,
                    },
                  },
                },
                {new: true, runValidators: true}
              ).populate('artworks');

              // here debit the credit from the guy who bids
              await User.findOneAndUpdate(
                {_id: data.userId},
                {$inc: {credit: -data.bid.amount}},
                {new: true} // Return the updated document
              );
              // here credit back the amount to the guy who got out bided
              const result = await Auction.findOne({
                artworks: data.artworkId,
              }).populate('artworks');
              let updatedUser = {};
              if (result) {
                const bids = result.bids.filter((bid) => {
                  return bid.artwork == data.artworkId;
                });
                const secondLastBid =
                  bids.length >= 2 ? bids[bids.length - 2] : null;

                if (secondLastBid) {
                  const refundAmount = secondLastBid.amount;
                  const refundUser = secondLastBid.user;
                  credictedUser = await User.findOneAndUpdate(
                    {_id: refundUser},
                    {$inc: {credit: refundAmount}},
                    {new: true} // Return the updated document
                  );
                }
              }
              const biddedUser = await User.findById({
                _id: data.userId,
              });

              io.to(data.id).emit('receive_bid', {
                auction,
                biddedUser,
                credictedUser,
                artworkId: data.artworkId,
                token,
              });
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
