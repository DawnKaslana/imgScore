const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const mysql = require('./mysql');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.listen(process.env.REACT_APP_SERVER_PORT, () => {
  console.log(`App server now listening on port ${process.env.REACT_APP_SERVER_PORT}`);
});

//test backend
app.get('/', (req, res) => {
  res.send('OAO')
});

//Connect Mysql Test
const test = (req, res) => {
  mysql('user').select('*')
  .then((result)=>{
    res.send(result)
  }).catch((err) => {
    console.error(err)
  })
}
app.get('/test', (req, res) => test(req, res));


//user
const {getUserList, addUser, putUser, deleteUser}  = require('./models/user');
app.get('/getUserList', (req, res) => getUserList(req, res));
app.post('/addUser', (req, res) => addUser(req, res));
app.put('/putUser', (req, res) => putUser(req, res));
app.delete('/deleteUser', (req, res) => deleteUser(req, res));



