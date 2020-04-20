const querystring = require('querystring')
const axios = require('axios');
var knex = require('./knex');

const client_credentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');

// Helper functions
function getClientToken () {
    axios.post(`https://accounts.spotify.com/api/token`,
        querystring.stringify({
            grant_type:'client_credentials'
        }),{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${client_credentials}`
            }
        }
    )
    .then(res => res.data)
    .then(data => {
        global.clientAccessToken = data['access_token']
    })
    .catch(err => console.error('Error getting client access token', err))
}
async function refreshTokenIfNeeded(queueData){
    if (Date.now() >= queueData.token_expires_at){
        console.log(`Token expired for ${queueData.room}`)

        const newTokenData = await axios.post(`https://accounts.spotify.com/api/token`,
        querystring.stringify({
            grant_type:'refresh_token',
            refresh_token: queueData.refresh_token
        }),{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${client_credentials}`
            }
        }
        )
        .then(res => res.data)
        .catch(err => {
            throw new Error('Spotify could not refresh token' + err)
        })

        const newExpireTime = Date.now() + 3600000
        await knex('queues').where('room', '=', queueData.room).update({
        access_token: newTokenData.access_token,
        token_expires_at: newExpireTime
        })
        .then(() => {
            queueData.access_token = newTokenData.access_token
            queueData.token_expires_at = newExpireTime
        })
        .catch(err => {
            throw new Error('Error updating new access token in db', err)
        })
    }
    return queueData
}
async function addTopToQueue(queueData) {
    // check if access_token needs to be refreshed
    queueData = await refreshTokenIfNeeded(queueData)
        .catch(err => { throw new Error('Error refreshing token: ' + err) })

    // get currently playing song
    const data = await axios.get(`https://api.spotify.com/v1/me/player/currently-playing`, { headers: { 'Authorization': `Bearer ${queueData.access_token}` }})
        .then(res => res.data)
        .catch(err => { throw new Error('Error getting currently playing song' + err)})

    console.log(data)

    // continue handling queueing
    // I also decided to make the common case (checking if current played matches) handle edge case where (current_queued == null)
    


    // // might optimize query later for performance from raw SQL
    // const top = await knex.select('id', 'uri').from('songs').where('queue', '=', queueData.room).orderBy('votes').first()
    
    // // Make call to spotify api - add song to queue
    // await axios.post(`https://api.spotify.com/v1/me/player/queue`, {uri: top.uri},{ headers: { 'Authorization': `Basic ${queueData.access_token}` }})
    //     .catch(err => { throw new Error('Error queueing song' + err)})

    // // Set song to queue's current_queued

        
    return

}
function autoQueue(){
    // get all queues
    knex('queues')
    .then(queues => {
        // for each queue
        queues.forEach((queue) => {
        // check if auto_queue is enabled
        if(!queue.auto_queue){
            console.log('no auto')
            return
        }
        // add top songs to queue
        addTopToQueue(queue)
        })
    })
    .catch(err => console.log('error getting queues', err))
}

// Run background tasks
getClientToken();
setInterval(getClientToken, 3600000);
autoQueue()
setInterval(autoQueue, 31000)