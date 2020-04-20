var LoginRouter = require('express').Router();
var knex = require('../knex');
var axios = require('axios');
const qs = require('querystring')

LoginRouter.get('/create', async function(req, res){
    var randomString = Math.random().toString(11).replace('0.', '')
    res.redirect('https://accounts.spotify.com/authorize' +
            '?response_type=code' +
            '&client_id=' + process.env.CLIENT_ID +
            '&scope=' + encodeURIComponent('user-read-private user-read-currently-playing') +
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
        console.log(tokenData)

        // get userdata
        const userData = await axios.get('https://api.spotify.com/v1/me', {headers: { Authorization: `Bearer ${tokenData.access_token}`}})
            .then(res => res.data)
        console.log('userData', userData)
        if(userData.product !== "premium"){
            throw("User needs Spotify Premium")
        }

        // generate new queue number
        const data = await knex.table('queues').pluck('room')
        var newQueue = Math.floor(Math.random()*(999-100+1)+100);
        while(data.includes(newQueue)){
            console.log(newQueue)
            newQueue = Math.floor(Math.random()*(999-100+1)+100);
        }

        // Create queue in database
        const newData = await knex('queues').insert({
                room: newQueue,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                created_by: userData.id,
                token_expires_at: Date.now() + 3600000
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
