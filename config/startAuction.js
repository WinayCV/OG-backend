const startTime = "2023-11-06T09:18";
const endTime = "2023-11-06T15:00";
const Auction = require("../models/auction-model");
const jwt = require("jsonwebtoken");
let auctionId = "";
let user = {};

module.exports = function (io) {
  // authenticating user token
  io.use((socket, next) => {
    let token = socket.handshake.headers["my-custom-header"];
    auctionId = socket.handshake.url;
    if (!token && !auctionId) {
      socket.emit("authentication", {
        error: { msg: "Authentication failed" },
      });
      return next(new Error("Authentication error"));
    }
    token = token.split(" ")[1];
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
      auctionId = auctionId.split("=")[1].split("&")[0];
      startAuction();
      next();
    } catch (error) {
      socket.emit("authentication", { error });
      next(new Error("Authentication error"));
    }
  });
  // getting auction
  const startAuction = async () => {
    const auction = await Auction.findById(auctionId);
    // console.log(auction.auctionStart);
    // console.log(auction.auctionEnd);
    const startTimeMillis =
      new Date(new Date(startTime) + 1 * 60 * 1000).getTime() +
      5.5 * 60 * 60 * 1000;
    const endTimeMillis =
      new Date(new Date(endTime) + 1 * 60 * 1000).getTime() +
      5.5 * 60 * 60 * 1000;
    const now = new Date(Date.now()).getTime() + 5.5 * 60 * 60 * 1000;
    const diff = startTimeMillis - now;
    const diff1 = endTimeMillis - now;
    //   console.log("end", endTimeMillis);
    //   console.log("start", startTimeMillis);
    //   console.log("now", now);
    //   console.log("diff", diff);
    //   console.log("diff1", diff1);
    setTimeout(() => {
      console.log("timer starts");
      io.on("connection", (socket) => {
        console.log("a user connected");
        // socket.on("auction_start", (data) => {
        //   console.log(data);
        //   io.emit("auction_stop", data);
        // });
        // user is joining the auction using auctionId
        socket.on("join_auction", (data) => {
          socket.join(data);
          console.log("User connected to room", data);
          io.emit("join_auction", data);
          socket.on("send_bid", (data) => {
            io.to(data.room).emit("receive_bid", data);
          });
          socket.on("disconnet", () => {
            console.log("user disconneted", socket.id);
          });
        });
      });
    }, diff);
    setTimeout(() => {
      io.close(); // Disconnect the socket
      // io.sockets.sockets.forEach((socket) => {
      //   socket.disconnect(true);
      // });
      console.log("stop");
    }, diff1);
  };
};
