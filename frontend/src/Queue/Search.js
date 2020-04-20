import React from 'react';
import {TextField, Avatar, Grid, Typography } from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab'
import {makeStyles} from '@material-ui/styles'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import {backendIP} from '../constants'

const useStyles = makeStyles(theme => ({
    avatar: {
      width: theme.spacing(6),
      height: theme.spacing(6),
      marginRight: theme.spacing(2)
    },
  }));

export default function Search( {addSong} ){    
    const [searchOptions, setSearchOptions] = React.useState();
    const [clientToken, setClientToken] = React.useState();

    React.useEffect(() => {
        fetch(`http://${backendIP}/queue/token/`, {mode: "cors"})
            .then(res => res.text())
            .then(data => {
                setClientToken(data)
            })
            
    }, [])

    function handleInputChange(event, value, reason) {
        if(value === '' || reason !== 'input'){
            setSearchOptions([])
            return undefined;
        }

        fetch(`https://api.spotify.com/v1/search?q=${value}&type=track&limit=5`, {
            headers: {
                'Authorization': `Bearer ${clientToken}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setSearchOptions(data.tracks.items)
        })
        .catch(err => {
            setSearchOptions([])
            console.log(err)
        })
    }

    function handleChange(event, value) {
        if(value) {
            addSong(value)
        }
    }
    
    const classes = useStyles();

    return (
        <Autocomplete
            id="free-solo-demo"
            freeSolo
            autoSelect
            onInputChange={handleInputChange}
            options={searchOptions}
            getOptionLabel={option => option.name}
            filterOptions={(x)=>x}
            onChange={handleChange}
            renderInput={params => (
                <TextField {...params}
                    label="Search"
                    margin="normal"
                    variant="outlined"
                    fullWidth
                />
            )}
            renderOption={(option, {inputValue}) => {
                const matches = match(option.name, inputValue);
                const parts = parse(option.name, matches);

                return (
                    <Grid container alignItems="center">
                      <Grid item>
                        <Avatar className={classes.avatar} src={option.album.images[2].url} />
                      </Grid>
                      <Grid item xs>
                        {parts.map((part, index) => (
                        <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                            {part.text}
                        </span>
                        ))}
                        <Typography variant="body2" color="textSecondary">
                          {option.artists[0].name}
                        </Typography>
                      </Grid>
                    </Grid>
                )
            }}
        />
    )
}