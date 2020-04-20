var queueRouter = require('express').Router();
var knex = require('../knex')

queueRouter.get('/q/:queue', function(req, res){
    knex.select('').table('queues').where('room', '=', req.params.queue)
        .then((data) => { console.log(data);
            data.length === 0 ? res.sendStatus(204) : res.sendStatus(200)})
        .catch(err => res.sendStatus(404))
});

queueRouter.get('/token', function(req, res) {
    res.send(clientAccessToken)
})

module.exports = queueRouter;