module.exports.addHandlers = function(io){
  var knex = require('./knex')
    
  io.on("connection", (socket) => {
    const queue = socket.handshake.query.queue;
    console.log(`New client connected: Queue# ${queue}`);
    socket.join(queue)
    console.log('socket.request', socket.handshake)    
    // need to send queue token with socket connection instead of getting it through queue route
    // need to send current queued as well.
    // Send initial songs
    knex.select('*').from('songs').where({'queue': queue, 'played': false})
      .then(data => socket.emit("songs", data))

    // Handle upvotes
    socket.on("upvote", async (songID) => {
      console.log('keys and values', Object.values(socket))
      // to improve performance, will need to build raw sql to do conditionals in the query as one atomic transaction
      return
      // check if exists
      let upvotedData = await knex('votes').where({session_id: socket.request.sessionID, song_id: songID})
        .then(answer => {
          //console.log('upvotedData', answer)
          return answer
        })
        // TODO: Error handling

      // if it doesn't exist, create it
      if(upvotedData.length < 1){

        upvotedData = await knex('votes').insert({song_id: songID, session_id: socket.request.sessionID, upvoted: true})
          .then(answer => {
            //console.log('inserted new upvoted', answer)
            return answer
          })
          .catch(err => {
            console.log('err inserting', err)
          }) // then error handling
      }

      // if already upvoted

      //console.log('upvotedData', upvotedData)
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
      knex('songs').insert({queue: queue, uri: song.uri, data: song}).returning('id')
        .then(res => {
          io.in(queue).emit('newsong', {id: res[0], votes: 0, queue: queue, data: song})
        })
        .catch(err => console.log('Error !!! \n\n', err))
    })

    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  return io;
};