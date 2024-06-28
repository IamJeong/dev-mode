const express = require('express');
const session = require('express-session');
const path = require('path');
const sdk = require('./sdk');
const checkSession = require('./middleware');

const app = express();

const PORT = 8001;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'hyperledgerfabric',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.post('/register', async function(req, res) {
    let { username, userId, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.json({ status: 'error', message: 'Passwords do not match' });
    }
    let args = [username, userId, password, confirmPassword];
    sdk.send(false, 'registerUser', args, res, (result) => {
        res.json({ status: 'success', message: 'Registration successful', result });
    });
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

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/mainpage.html', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/mainpage.html'));
});
app.get('/mainpage', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/mainpage.html'));
});


app.get('/recharge', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/recharge.html'));
});
app.get('/recharge.html', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/recharge.html'));
});

app.post('/recharge', checkSession, async function(req, res) {
    let { amount } = req.body;
    let userId = req.session.user;
    let args = [userId, amount];
    sdk.send(false, 'rechargePoints', args, res, (result) => {
        res.json({ status: 'success', message: 'Points recharged successfully', result });
    });
});

app.get('/query', checkSession, function(req, res) {
    let userId = req.session.user;
    let args = [userId];
    sdk.send(true, 'query', args, res, (result) => {
        res.json({ status: 'success', data: JSON.parse(result) });
    });
});

app.use(express.static(path.join(__dirname, '../client')));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
