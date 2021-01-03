var queueRouter = require('express').Router();
var knex = require('../utils/knex')

queueRouter.get('/q/:queue', function(req, res){
    knex.select('').table('queues').where('room', '=', req.params.queue)
        .then((data) => { console.log(data);
            data.length === 0 ? res.sendStatus(204) : res.sendStatus(200)})
        .catch(err => res.sendStatus(404))
});

// get 

// move to sockets when connected
queueRouter.get('/token', function(req, res) {
    res.send(global.clientAccessToken)
})

module.exports = queueRouter;