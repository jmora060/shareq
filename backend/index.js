require('dotenv').config()
var express = require('express')
var app = express();
var server = require('http').createServer(app)
//var redis_cache = require('./middleware/redis_cache')
const port = process.env.port || 8000;
const axios = require('axios');
const cors = require('cors')

// Sessions
const session = require('express-session')
var knex = require('./db');
const KnexSessionStore = require('connect-session-knex')(session)
const sessionStore = new KnexSessionStore({
    knex: knex,
    tablename: "sessions", // optional. Defaults to 'sessions'
    createtable: true,
  });

// add sockets
var io = require('./sockets').startServer(server)

// middleware
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(session({
    secret: "jake app",
    cookie: {
      maxAge: 3600000 // ten seconds, for testing .. even put?
    },
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
  })
);

const querystring = require('querystring')

// Routes
const QueueRouter = require('./routes/queue')
const LoginRouter = require('./routes/login')

// add routes
app.use('/queue', QueueRouter)
app.use('/login', LoginRouter)

server.listen(port, () => console.log(`listening on *:${port}`));

var clientAccessToken = '';
const client_credentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')

// Client Token
const getClientToken = () => {
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
    .then((res) => res.data)
    .then((data) => {
        clientAccessToken = data['access_token']
        console.log(data.access_token)
    })
    .catch(err => console.error('Error getting client access token', err))
}
getClientToken();
setInterval(getClientToken, 3600000);
global.getToken = () => clientAccessToken;

// use setTimeout(0) to trigger new events

// TODO
// Login - post
// Then create/join queue - post(authorized), get, 

// frontpage is create/join queue - then create takes you to new page to login. 

// sockets - new/deleted songs, fetching songs, upvotes/downvotes, see if user already voted
// queue must be 3 digits?
// 