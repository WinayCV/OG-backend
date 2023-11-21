// const jwt = require('jsonwebtoken');
// let auctionId = '';
// let user = {};

//   // authenticating user token
//   io.use((socket, next) => {
//     let token = socket.handshake.headers['my-custom-header'];
//     auctionId = socket.handshake.query.id;

//     if (!token && !auctionId) {
//       socket.emit('authentication', {
//         error: {msg: 'Authentication failed'},
//       });
//       return next(new Error('Authentication error'));
//     }
//     token = token.split(' ')[1];
//     try {
//       user = jwt.verify(token, process.env.JWT_SECRET);
//       // auctionId = auctionId.split('=')[1].split('&')[0];
//       startAuction();
//       next();
//     } catch (error) {
//       socket.emit('authentication', {error});
//       next(new Error('Authentication error'));
//     }
// });
//   // getting auction
//   const startAuction = async () => {
//
//     // here assign auction start and end time for the setTime out
//     const startTime = auction.auctionStart;
//     const endTime = auction.auctionEnd;
//     console.log(auction.auctionStart);
//     console.log(auction.auctionEnd);
//     const startTimeMillis =
//       new Date(new Date(startTime) + 1 * 60 * 1000).getTime() +
//       5.5 * 60 * 60 * 1000;
//     const endTimeMillis =
//       new Date(new Date(endTime) + 1 * 60 * 1000).getTime() +
//       5.5 * 60 * 60 * 1000;
//     const now = new Date(Date.now()).getTime() + 5.5 * 60 * 60 * 1000;
//     const diff = startTimeMillis - now;
//     const diff1 = endTimeMillis - now;

//     setTimeout(() => {
//       console.log('timer starts');
//     }, diff);
//     setTimeout(() => {
//       io.close(); // Disconnect the socket
//       // io.sockets.sockets.forEach((socket) => {
//       //   socket.disconnect(true);
//       // });
//       console.log('stop');
//     }, diff1);
//   };
// };
