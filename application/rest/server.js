const express = require('express');
const session = require('express-session');
const path = require('path');
const sdk = require('./sdk');
const checkSession = require('./middleware'); // 미들웨어 불러오기

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

// 로그인 및 회원가입 경로는 세션 검사를 하지 않도록 설정
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

// 세션 미들웨어를 필요한 경로에만 적용
app.get('/mainpage', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/mainpage.html'));
});

app.post('/recharge', checkSession, async function(req, res) {
    let { amount } = req.body;
    let userId = req.session.user;
    let args = [userId, amount];
    sdk.send(false, 'rechargePoints', args, res, (result) => {
        res.json({ status: 'success', message: 'Points recharged successfully', result });
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
