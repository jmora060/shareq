import React from 'react';
import './App.css';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Queue from './Queue/Queue'
import Home from './Home/Home'
import {Container} from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'; // Normalize CSS
import 'typeface-montserrat';
import { ThemeProvider, createMuiTheme} from '@material-ui/core/styles';
//import {responsiveFontSizes} from '@material-ui/core/styles'
import { teal} from '@material-ui/core/colors/teal'


let newTheme = createMuiTheme({
  palette: {
    primary: teal,
    type: 'light'
  }
})
//theme = responsiveFontSizes(theme)

export default function App() {
  return (
    <>
      <CssBaseline>
      <ThemeProvider theme={newTheme}>
        <Container maxWidth="sm">
          <BrowserRouter>
            <Switch>
              <Route path='/:queue'>
                <Queue />
              </Route>
              <Route path='/'>
                <Home />
              </Route>
            </Switch>
          </BrowserRouter>
        </Container>
      </ThemeProvider>
      </CssBaseline>
    </>
  );
}
