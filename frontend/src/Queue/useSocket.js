// Custom React Hook for sockets
import {useState, useEffect} from 'react'
import io from 'socket.io-client'
import {backendIP} from '../constants.json'

export default function useSocket (queue) {
    // initial value is function to prevent running the function on every
    const [socket] = useState(() => io(`http://${backendIP}?queue=${queue}`))
    const [tracks, setTracks] = useState([])

    useEffect(() => { 
        socket.on('songs', (data) => {
            console.log(data)
            setTracks(data)
        })

        socket.on('upvoted', (data) => {
            setTracks((songs) => {
                return songs.map( (elem) => {
                    if (elem.id === data.songID){
                        elem.votes = data.votes
                    }
                    return elem
                })
            })
        })

        socket.on('downvoted', (data) => {
            setTracks((songs) => {
                return songs.map( (elem) => {
                    if (elem.id === data.songID){
                        elem.votes = data.votes
                    }
                    return elem
                })
            })
        })

        socket.on('newsong', (data) => {
            setTracks((tracks) => [...tracks, data])
        })
        
        // run function when component unmounts or socket changes
        return () => {
            socket && socket.removeAllListeners();
            socket && socket.close();
        }
    }, []) // empty dependency array means run useEffect once

    function addSong(song) {
        // add song
        socket.emit('addsong', {song})
    }
    
    function upVote(songID) {
        socket.emit('upvote', songID)
    }

    function downVote(songID){
        socket.emit('downvote', songID)
    }

    return [tracks, addSong, upVote, downVote]
}