const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const ws = require('ws');

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));

app.get('/profile', async (req, res) => {
    const {
        token
    } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, payload) => {
        if (err) return res.status(401).json({
            message: 'Unauthorized'
        });
        const user = await User.findById(payload.userId);
        res.json(user);
    });
});

app.post('/login', async (req, res) => {
    const {username,password} = req.body;
    const foundUser = await User.findOne({
        username
    });
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({
                userId: foundUser._id,
                username,
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    sameSite: 'none',
                    secure: true
                }).status(200).json({
                    id: foundUser._id,
                    username,
                });
            });
        }
    }
});


app.post('/register', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username: username,
            password: hashedPassword,
        });
        jwt.sign({
            userId: createdUser._id,
            username,
        }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                sameSite: 'none',
                secure: true
            }).status(201).json({
                id: createdUser._id,
                username,
            });
        });
    } catch (err) {
        if (err) throw err;
        res.status(500).json('error');
    }
});

const server = app.listen(4000);

const wss = new ws.WebSocketServer({
    server
})

//read username and id from cookie for ws connection
wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            jwt.verify(token, jwtSecret, {}, (err, payload) => {
                if (err) return res.status(401).json({
                    message: 'Unauthorized'
                });
                const {
                    userId,
                    username
                } = payload;
                connection.userId = userId;
                connection.username = username;
            });
        }
    }

    connection.on('message', async (message) => {
        messageData = JSON.parse(message.toString());
        const {
            recipient,
            text
        } = messageData;
        if (recipient && text) {
            const messageDocument = await Message.create({
                sender: connection.userId,
                recipient,
                text,
            });
            [...wss.clients]
            .filter(client => client.userId === recipient)
                .forEach(client => {
                    client.send(JSON.stringify({
                        text,
                        sender: connection.userId,
                        id: messageDocument._id,
                    }))
                })
        }
    });

    //notificition about online people or when someone connects to the socket
    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({
                userId: c.userId,
                username: c.username
            }))
        }))
    });
});