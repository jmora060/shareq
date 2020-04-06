import React from 'react';
import { Typography, Grid, Paper} from '@material-ui/core'
import JoinButton from './JoinButton'
import CreateButton from './CreateButton'

export default function Home() {

    return (
        <Paper>
            <Grid container direction="column" justify="center" alignItems="center">
                <Grid item>
                    <Typography variant="h1">ShareQ</Typography>
                </Grid>
                <Grid>
                    <Typography variant="h5">The best place to make queues.</Typography>
                </Grid>
                <Grid item container direction="row" justify="center" alignItems="center" spacing={4}>
                    <Grid item>
                        <JoinButton />
                    </Grid>
                    <Grid item>
                        <CreateButton />
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    );
}