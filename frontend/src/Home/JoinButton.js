import React from 'react';
import {Button, TextField, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText} from '@material-ui/core'
import {backendIP} from '../constants.json'

export default function JoinButton () {
    const [isOpen, setOpen] = React.useState(false)
    const [code, setCode] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState(null);

    let error = Boolean(errorMessage)

    const handleJoin = () => {
        if(code.length < 3 ) {
            setErrorMessage('THREE digits, bro.')
            return;
        }
        fetch(`http://${backendIP}/queue/q/${code}`)
            .then((res) => {console.log(res.status);
                res.status === 200 ? window.location.href = `/${code}` : setErrorMessage('Queue does not exist.')})
            .catch(err => console.log(err))
    }

    return (
        <>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Join Queue</Button>
            <Dialog open={isOpen} onClose={() => setOpen(false)}>
                <DialogTitle id="dialog-title">Join Queue</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the 3-digit code.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        margin="dense"
                        placeholder="Code"
                        type="number"
                        value={code}
                        helperText={error ? errorMessage : null}
                        onChange={(e) => {if(e.target.value.length <= 3) setCode(e.target.value)}}
                        onKeyDown={(e) => {if(e.keyCode === 13) handleJoin()}}
                        onFocus={() => setErrorMessage('')}
                        error={error}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" variant="contained" onClick={handleJoin}>
                        Join
                    </Button>
                    <Button color="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}