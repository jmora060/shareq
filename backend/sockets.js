
module.exports.startServer = function(server){
  var knex = require('./db')
  var io = require('socket.io')(server);
    
    io.on("connection", (socket) => {
      console.log(`New client connected: Queue# ${socket.handshake.query.queue}`);
      socket.join(`Queue${socket.handshake.query.queue}`)

      // Send initial songs
      knex.select('*').from('songs').where('queue', '=', 275)
        .then(data => socket.emit("songs", data))

      // Handle upvotes
      socket.on("upvote", (songID)=>{
        console.log('upvoting: ' + songID)
        knex('songs').where('id', '=', songID).increment('votes', 1).returning('votes')
          .then(data => socket.emit('upvoted', {
              songID: Number(songID),
              votes: data[0]
          }))
          .catch(err => res.sendStatus(404))
      });

      // Handle downvotes
      socket.on("downvote", (songID) => {
        console.log('downvoting: ' + songID)
        knex('songs').where('id', '=', songID).decrement('votes', 1).returning('votes')
          .then(data => socket.emit('downvoted', {
              songID: Number(songID),
              votes: data[0]
          }))
          .catch(err => res.sendStatus(404))
      })

      // Handle new song
      socket.on("newsong", (data) => {
        // TODO
        console.log(data)
      })

      socket.on("disconnect", () => console.log("Client disconnected"));
    });

    return io;
};