
module.exports.startServer = function(server){
  var knex = require('./knex')
  var io = require('socket.io')(server);
    
  io.on("connection", (socket) => {
    const queue = socket.handshake.query.queue;
    console.log(`New client connected: Queue# ${queue}`);
    socket.join(queue)

    // Send initial songs
    knex.select('*').from('songs').where('queue', '=', queue)
      .then(data => socket.emit("songs", data))

    // Handle upvotes
    socket.on("upvote", (songID)=>{
      console.log('upvoting: ' + songID)
      knex('songs').where('id', '=', songID).increment('votes', 1).returning('votes')
        .then(data => io.in(queue).emit('upvoted', {
            songID: Number(songID),
            votes: data[0]
        }))
        .catch(err => res.sendStatus(404))
    });

    // Handle downvotes
    socket.on("downvote", (songID) => {
      console.log('downvoting: ' + songID)
      knex('songs').where('id', '=', songID).decrement('votes', 1).returning('votes')
        .then(data => io.in(queue).emit('downvoted', {
            songID: Number(songID),
            votes: data[0]
        }))
        .catch(err => res.sendStatus(404))
    })

    // Handle new song
    socket.on("addsong", ({song}) => {
      // TODO
      knex('songs').insert({queue: queue, data: song}).returning('id')
        .then(res => {
          io.in(queue).emit('newsong', {id: res[0], votes: 0, queue: queue, data: song})
        })
        .catch(err => console.log('Error !!! \n\n', err))
    })

    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  return io;
};