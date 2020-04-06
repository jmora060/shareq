var queueRouter = require('express').Router();
var knex = require('../db')

queueRouter.get('/q/:queue', function(req, res){
    knex.select('').table('queues').where('room', '=', req.params.queue)
        .then((data) => { console.log(data);
            data.length === 0 ? res.sendStatus(204) : res.sendStatus(200)})
        .catch(err => res.sendStatus(404))
});

queueRouter.get('/token', function(req, res) {
    res.send(global.getToken())
})

queueRouter.get('/upvote/:songID', function(req, res){
    knex('songs').where('id', '=', req.params.songID).increment('votes', 1).returning('votes')
        .then(data => res.send({
            songID: Number(req.params.songID),
            votes: data[0]
        }))
        .catch(err => res.sendStatus(404))
})

module.exports = queueRouter;