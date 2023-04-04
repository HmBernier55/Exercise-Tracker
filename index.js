const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static('public'))

// FRONT END
// Created by FCC
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Connecting to MongoDB database
mongoose.connect("mongodb+srv://hunterbernier:Futbol10@cluster0.kmkggsk.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true});

// Testing the connection to the MongoDB database
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log("Connection established!");
});

// Setting up the schema for the data
let userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: String
  }]
});

let newUser = mongoose.model("newUser", userSchema);

// BACK END

app.route("/api/users").post(async function(req, res) {
/*
Inputs:
  A username string inputted by the user

Outputs:
  POST route:
    JSON object with the format:
      {
        username: <inputted username string>,
        _id: <unique id created by MongoDB>
      }
  GET route:
      List of all users within the database where each user is an object
      with the same format as above
*/
  new newUser({
    username: req.body.username,
    count: 0
  }).save((err, data) => {
    if (err) return console.log(err);
  });
  let foundUser = await newUser.find({username: req.body.username}, (err, docs) => {
    if (err) return console.log(err);
  });
  res.json({
    username: foundUser[0].username,
    _id: foundUser[0]._id
  });
}).get((req, res) => {
  newUser.find({}, (err, users) => {
    if (err) return console.log(err);
    const userList = [];
    let counter = 0;
    for (let user of users) {
      let singleUser = {
        username: user.username,
        _id: user._id
      }
      userList.push(singleUser);
      counter++
      if (counter === users.length) {
        res.json(userList);
      }
    }
  });
});

app.post("/api/users/:id/exercises", (req, res) => {
/*
Inputs:
  A description, duration, and date of an exercise that the user wants to log

Outputs:
  JSON object with the following format:
    {
      username: <username string>,
      description: <inputted description string>,
      duration: <inputted duration integer>,
      date: <date string>,
      _id: <unique id created by MongoDB>
    }
*/
  let dateOfExercise = new Date(req.body.date).toDateString();
  if (dateOfExercise === 'Invalid Date') {
    dateOfExercise = new Date().toDateString();
  }
  const exerciseObj = {
    description: req.body.description,
    duration: req.body.duration,
    date: dateOfExercise
  };
  newUser.findById(req.params.id, (err, userFound) => {
    if (err) return console.log(err);
    userFound["log"].push(exerciseObj);
    userFound["count"]++;
    userFound.save((err, savedUser) => {
      if (err) return console.log(err);
    });
    res.json({
      username: userFound.username,
      description: req.body.description,
      duration: Number(req.body.duration),
      date: dateOfExercise,
      _id: req.params.id
    });
  });
});

app.get("/api/users/:id/logs?", (req, res) => {
/*
Inputs:
  Unique id, that corresponds to a user in the database, inputted into the URL

Outputs:
  JSON object of the following format:
    {
      username: <username string>,
      count: <number of exercises logged to the database for the user>,
      _id: <unique id string>,
      log: [{
        description: <exercise description string>,
        duration: <exercise duration integer>,
        date: <date string>
      }, ...]
    }
*/
  newUser.findById(req.params.id, (err, logUser) => {
    if (err) return console.log(err);
    let newLog = [];
    for (let i = 0; i < logUser.log.length; i++) {
      let tempObj = {};
      tempObj.description = logUser.log[i].description
      tempObj.duration = logUser.log[i].duration
      tempObj.date = logUser.log[i].date
      newLog.push(tempObj);
    }
    if (req.query.from && req.query.to) {
      const upperDate = new Date(req.query.to);
      const lowerDate = new Date(req.query.from);
      newLog = newLog.filter(ele => {
        let tempDate = new Date(ele.date);
        return tempDate >= lowerDate && tempDate <= upperDate;
      })
    }
    if (req.query.limit) {
      newLog = newLog.slice(0, req.query.limit);
    }
    res.json({
      username: logUser.username,
      count: logUser.count,
      _id: req.params.id,
      log: newLog
    });
  });
});


const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
