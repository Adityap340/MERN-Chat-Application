const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jwtSecret = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
app.get('/test', (req, res) => {
    res.json('test ok');
});
app.get('/profile', async (req, res) => {
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users)
})

app.post('/register', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    const createdUser = await User.create({
        username,
        password
    });
    jwt.sign({
        userId: createdUser._id
    }, jwtSecret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).status(201).json({
                id: createdUser._id,
            }

        );
    });
});
app.listen(4000);