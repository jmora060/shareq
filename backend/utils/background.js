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
    // eventually need to implement a retry button to requeue

    // check if current_queued is null
    if (!queueData.current_queued){
        const top = await knex.select('id', 'uri').from('songs').where({'queue': queueData.room, 'played': false}).orderBy('votes', 'desc').first()
        if(top){
            await knex('queues').where('room', '=', queueData.room).update({current_queued: top})
                .then(async(res) => {
                    // 0 means none update (false), 1 means it updated (true)
                    if (res){
                        queueData.current_queued = top
                        // update song to played
                        await knex('songs').where('id', '=', top.id).update({played: true})
                            .then(res2 => {
                                // 0 means none upated (false), 1 means it updated (true)
                                if (res2){
                                    //console.log('updated played')
                                }
                                else{
                                    throw new Error('did not update top to "played" status')
                                }
                            })
                            .catch(err => {throw new Error('did not update top to "played" status')})
                    }
                })
                .catch(err => {throw new Error('Error setting current_queueed' + err)})
            
        } else {return;}
    }

    // if current_queued is still null, then no songs to queue
    if(!queueData.current_queued){
        console.log('no songs to quque')
        return
    }

    // check if access_token needs to be refreshed
    queueData = await refreshTokenIfNeeded(queueData)
        .catch(err => { throw new Error('Error refreshing token: ' + err) })

    // check current playing = current queued
    const currently_playing = await axios.get("https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers:{ "Authorization": `Bearer ${queueData.access_token}` }
        })
        .then(res => res.data)
        .catch(err => {throw new Error ('Error getting currently playing')})

    // if no currently playing song or it doesn't match top, then continue
    if (!currently_playing || currently_playing.item.uri !== queueData.current_queued.uri) {
        console.log('no current playing or they do not match')
        return
    }

    // else rotate songs

    // get next song to queue. might implement where these are all done at once, and rollbacks when one fails.
    const nextTop = await knex.select('id', 'uri').from('songs').where({'queue': queueData.room, 'played': false}).orderBy('votes', 'desc').first()
    if(!nextTop){
        // no more songs to queue.. set current null
        console.log('no nexttop, setting next to null')
        await knex('queues').where("room", "=", queueData.room).update({current_queued: null})
        .then(res => {
            if (!res){
                throw new Error('Nothing updated')
            }
        })
        .catch(err => {throw new Error('Did not update current_queued in queues:' + err)})
        return
    }

    await axios({
            method: 'post',
            url: `https://api.spotify.com/v1/me/player/queue?uri=${nextTop.uri}`, 
            headers: {'Authorization': `Bearer ${queueData.access_token}`}
        })
        .then(res => {
            if(res.status !== 204){
                throw new Error('Failed to queue song' + res)
            }
            else{
                console.log('queued nextop: ', nextTop)
            }
        })
        .catch(err => {throw new Error('err adding queue' + err)})

    await knex('songs').where('id', '=', nextTop.id).update({played: true})
        .then(res => {
            if (!res){
                throw new Error('Did not update next top to played true')
            }
        })
        .catch(err => {throw new Error('Error updated nextTop played to true: ' + err)})
    
    await knex('queues').where("room", "=", queueData.room).update({current_queued: nextTop})
        .then(res => {
            if (!res){
                throw new Error('Did not update current_queued to next top in queues: ')
            }
        })
        .catch(err => {throw new Error('Error updating nextTop in queues: ' + err)})
    // notify clients in socket that next song was popped off
    global.io.in(queueData.room).emit('topQueued', nextTop.id)



    // update frontend that top was popped off


    // also need to implement "retry button" or "requeue" for current queued song that never got played
    // add "current queued" to UI in frontend next to retry button

    // get currently playing song
    // const data = await axios.get(`https://api.spotify.com/v1/me/player/currently-playing`, { headers: { 'Authorization': `Bearer ${queueData.access_token}` }})
    //     .then(res => res.data)
    //     .catch(err => { throw new Error('Error getting currently playing song' + err)})

    // continue handling queueing
    // I also decided to make the common case (checking if current played matches) handle edge case where (current_queued == null)


    
    // // Make call to spotify api - add song to queue
    // await axios.post(`https://api.spotify.com/v1/me/player/queue`, {uri: top.uri},{ headers: { 'Authorization': `Basic ${queueData.access_token}` }})
    //     .catch(err => { throw new Error('Error queueing song' + err)})

        
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
            console.log(`Skipping Queue#${queue.room}. Autoqueue turned off`)
            return
        }
        // add top songs to queue
        addTopToQueue(queue)
            .catch(err => console.log('err auto queue', err))
        })
    })
    .catch(err => console.log('error getting queues', err))
}

// Run background tasks
getClientToken();
setInterval(getClientToken, 3600000);
autoQueue()
setInterval(autoQueue, 31000)