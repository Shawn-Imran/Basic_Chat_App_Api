/**
 * NODEJS API
 * DATABASE MONGODB
 * VERSION 1.0.0
 * POWERED BY SOFTLAB IT
 * DEVELOP BY MD IQBAL HOSSEN
 */
const express = require("express");
const mongoose = require('mongoose');
const crossUnblocker = require('./middileware/cros-unblocker');
const dotenv = require('dotenv').config();

// Cross Unblocked File..
const cors = require('cors');
const errorHandler = require('./middileware/error-handler');

const Message = require('./models/message');




/**
 *  Router File Import
 */
const userRoutes = require('./routes/user');




/**
 * MAIN APP CONFIG
 * REPLACE BODY PARSER WITH EXPRESS PARSER
 */

const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http,{
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"]
    }
  });
// app.use(crossUnblocker.allowCross)
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}))


/**
 * MAIN BASE ROUTER WITH IMPORTED ROUTES
 */
app.use('/api/user', userRoutes);


/**
 * MAIN BASE GET PATH
 */
app.get('/', (req, res) => {
    res.send('<div style="width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center"><h1 style="color: blueviolet; text-transform: uppercase">FelnaTech RUNNING...</h1><p style="color: lightcoral">Powered by Shawn Imran</p></div>')
})


/**
 * Error Handler
 * 401 UnAuthorized, Access Denied
 * 406 Already Exists, Not Acceptable
 * 404 Not Found
 * 422 Input Validation Error, Unprocessable Entity
 * 500 Database Operation Error, Internal Server Error
 */
app.use(errorHandler.route);
app.use(errorHandler.next);


/**
 * chat app server
 */
const chat = io.of('/chat');
chat.on('connection', function(socket){
  //get message from database
  console.log('a user connected');
  Message.find().limit(20).exec((err, messages) => {
    if(err) throw err;
    socket.emit('load old messages', messages);
  });
  
  // .then((messages) => {
  //   console.log(messages);
  //   socket.emit('load old messages', messages);
  // });


  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('message', function(msg){  

    

    chat.emit('message', msg);
    console.log(msg);
    const message = new Message(msg);
    message.save();
  });
});


/**
 * NODEJS SERVER
 * PORT CONTROL
 * MongoDB Connection
 * Database Name shopkichu
 */
mongoose.connect(
    `mongodb://localhost:27017/${process.env.DB_NAME}`,
    {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
).then(() => {
        const port = process.env.PORT || 3000;
        http.listen(port, () => console.log(`Server is running at port:${port}`));
        console.log('Connected to mongoDB');

}).catch(err => {
        console.error('Oops! Could not connect to mongoDB Cluster0', err);
})
