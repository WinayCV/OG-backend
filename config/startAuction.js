const startTime = "2023-11-05T11:50";
const endTime = "2023-11-05T101:52";

module.exports = function (io) {
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
    // console.log("timer starts");
    io.on("connection", (socket) => {
      console.log("a user connected");
      socket.on("auction_start", (data) => {
        console.log(data);
        io.emit("auction_stop", data);
      });
      socket.on("join_room", (data) => {
        //   socket.join(data);
        console.log("User connected to room", data);

        socket.on("send_message", (data) => {
          socket.to(data.room).emit("receive_message", data);
        });
        socket.on("disconnet", () => {
          console.log("user disconneted", socket.id);
        });
      });
    });
  }, diff);
  setTimeout(() => {
    // io.close(); // Disconnect the socket
    // console.log("timer stop");
  }, diff1);
};
