import React, { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Search from './Search'
import Track from './Track'
import {backendIP} from '../constants.json'
import {Grid} from '@material-ui/core'
import useSocket from './useSocket'

const useStyles = makeStyles(theme => ({
    grid: {
      //padding: theme.spacing(4),
    },
}));

export default function Queue(){
    let theme = useTheme();
    const classes = useStyles();
    let {queue} = useParams();
    const [tracks, addSong, upVote, downVote] = useSocket(queue)

    return (
        <>
            <Search addSong={addSong}/>
            <Grid container direction="column" justify="flex-start"  spacing={2}>
                {tracks.sort((a, b) => b.votes - a.votes).map((track) => {
                    return <Track key={track.id} track={track} upVote={upVote} downVote={downVote}/>
                })}
            </Grid>
        </>
    )
}