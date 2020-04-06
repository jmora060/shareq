import React from 'react';
import { Button, Backdrop} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress';
import {backendIP} from '../constants.json'

const useStyles = makeStyles(theme => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

export default function CreateButton () {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false)

    return (
        <>
            <Button variant="contained" color="secondary" onClick={() => {setOpen(true); window.location.href = `http://${backendIP}/login/create`}}>Create Queue</Button>
            <Backdrop className={classes.backdrop} open={open} >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}