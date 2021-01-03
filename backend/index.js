require('dotenv').config()
var express = require('express');
var app = express()
var server = require('http').createServer(app)
//var redis_cache = require('./middleware/redis_cache')
const port = process.env.port || 8000;
const cors = require('cors')

// Run background tasks
require('./utils/background')

// Add sessions
const session = require('express-session')
var knex = require('./utils/knex');
const KnexSessionStore = require('connect-session-knex')(session)
const sessionStore = new KnexSessionStore({
    knex: knex,
    tablename: "sessions", // optional. Defaults to 'sessions'
    createtable: true,
  });
const sessionMiddleware = session({
  secret: "jake app",
  cookie: {
    maxAge: 3600000 // ten seconds, for testing .. even put?
  },
  store: sessionStore,
  resave: true,
  saveUninitialized: true,
})

// Add middleware
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(sessionMiddleware);


// Add websockets & socket middleware
//var sharedsession = require('express-socket.io-session')
var sio = require('socket.io')(server);
sio.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
//sio.use(sharedsession(session))
global.io = require('./utils/sockets').addHandlers(sio)

// Add routes
const QueueRouter = require('./routes/queue')
const LoginRouter = require('./routes/login');
app.use('/queue', QueueRouter)
app.use('/login', LoginRouter)

// Start server
server.listen(port, () => console.log(`listening on *:${port}`)); 