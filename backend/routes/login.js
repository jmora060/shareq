var LoginRouter = require('express').Router();
var knex = require('../utils/knex');
var axios = require('axios');
const qs = require('querystring')

LoginRouter.get('/create', async function(req, res){
    var randomString = Math.random().toString(11).replace('0.', '')
    req.session.random = randomString
    res.redirect('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + process.env.CLIENT_ID +
            '&scope=' + encodeURIComponent('user-read-private user-read-currently-playing user-modify-playback-state') +
            '&redirect_uri=' + encodeURIComponent('http://localhost:8000/login/callback') +
            '&state=' + randomString
            );
})

LoginRouter.get('/callback', async function(req, res) {
    try{
        // Error checking
        if(req.query.error){
            console.log('callback error')
        }
        else if(req.session.random && req.session.random !== req.query.state){
            res.redirect(`http://localhost:3000/`)
        }

        // get tokens to access user data
        const tokenData = await axios({
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                data: qs.stringify({
                    grant_type: "authorization_code",
                    code: req.query.code,
                    redirect_uri: 'http://localhost:8000/login/callback'
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')}`,
                }
            })
            .then(res => res.data)
            .catch(err => {
                throw(err)
            })

        // get userdata
        const userData = await axios.get('https://api.spotify.com/v1/me', {headers: { Authorization: `Bearer ${tokenData.access_token}`}})
            .then(res => res.data)
        if(userData.product !== "premium"){
            throw("User needs Spotify Premium")
        }

        // check if a queue already exists, if so, redirect them.
        const already_created = await knex.select('room').from('queues').where("created_by", "=", userData.id)
            .then(result => {
                if(result.length){
                    // already have a queue
                    req.session.queue = result[0].room
                    res.redirect(`http://localhost:3000/${result[0].room}`)
                    return true
                }
                else {
                    return false
                }
            })
            .catch(err => console.log(err))
        if (already_created){
            console.log('user already has a queue. Redirected')
            return
        }

        // generate new queue number. maybe make this async for better performance with node
        const data = await knex.table('queues').pluck('room')
        var newQueue = Math.floor(Math.random()*(999-100+1)+100);
        while(data.includes(newQueue)){
            console.log(newQueue)
            newQueue = Math.floor(Math.random()*(999-100+1)+100);
        }

        // Create queue in database
        await knex('queues').insert({
                room: newQueue,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                created_by: userData.id,
                token_expires_at: Date.now() + 3600000
            })
            .then(response => {
                if(response.rowCount === 0){
                    throw new Error('Failed to created queue in db')
                }
            })
            .catch(err => {throw(err)})


        // save data to session (in db)
        req.session.queue = newQueue
        console.log('Spotify passed')
        res.redirect(`http://localhost:3000/${newQueue}`)
    }
    catch(err){
        console.log(err)
        res.send(err)
    }
})

module.exports = LoginRouter;
