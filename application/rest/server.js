const express = require('express');
const session = require('express-session');
const app = express();
let path = require('path');
let sdk = require('./sdk');

const PORT = 8001;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'hyperledgerfabric',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.post('/register', async function(req, res) {
    let { username, userId, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.json({ status: 'error', message: 'Passwords do not match' });
    }
    let args = [username, userId, password, confirmPassword];
    await sdk.send(false, 'registerUser', args, res);
});

app.post('/login', async function(req, res) {
    let { userId, password } = req.body;
    let args = [userId, password];
    sdk.send(true, 'loginUser', args, res, (result) => {
        if (result === 'Login successful') {
            req.session.user = userId;
            res.json({ status: 'success' });
        } else {
            res.json({ status: 'error', message: 'Invalid login' });
        }
    });
});

app.get('/init', function (req, res) {
    let user = req.query.user;
    let userVal = req.query.userVal;
    let args = [user, userVal];
    sdk.send(false, 'init', args, res);
});

app.get('/delete', function (req, res) {
    let name = req.query.name;
    let args = [name];
    sdk.send(false, 'delete', args, res);
});

app.get('/invoke', function (req, res) {
    let sender = req.query.sender;
    let receiver = req.query.receiver;
    let amount = req.query.amount;
    let args = [sender, receiver, amount];
    sdk.send(false, 'invoke', args, res);
});

app.get('/query', function (req, res) {
    let name = req.query.name;
    let args = [name];
    sdk.send(true, 'query', args, res);
});

app.use(express.static(path.join(__dirname, '../client')));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
