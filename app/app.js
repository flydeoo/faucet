const express = require('express');
const faucetController = require('./controllers/faucet/index');



// creates an instance of an express application
const app = express();


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
app.use(express.static(path.join(__dirname, '/public/')));

app.set('view engine', 'vash');  



app.get('/', faucetController.home);
app.post('/', faucetController.submit);

app.listen(3000);
