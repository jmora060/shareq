import React from 'react'
import {Grid, IconButton, Typography} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

export default function Track ({track, upVote, downVote}) {
    const classes = useStyles();
    const data = track.data;

    return (
        <Grid item container className={classes.root}>
            <Grid item xs={8}>
                {data.name} 
            </Grid>
            <Grid item xs={1}>
                <IconButton onClick={() => upVote(track.id)}>
                    <ArrowUpwardIcon fontSize="small"/>
                </IconButton>
            </Grid>
            <Grid item xs={2}>
                <Typography variant="h4" align="center">
                    {track.votes}
                </Typography>
            </Grid>
            <Grid item xs={1}>
               <IconButton onClick={() => downVote(track.id)}>
                    <ArrowDownwardIcon fontSize="small"/>
                </IconButton>
            </Grid>
        </Grid>
    )
}