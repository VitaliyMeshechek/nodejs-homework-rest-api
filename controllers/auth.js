const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const { HttpError, ctrlWrapper } = require("..//helpers");

const {User} = require('../models/user');

require("dotenv").config();

const {SECRET_KEY} = process.env;


const register = async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "This email is already in use");
    }

    const createHashPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({...req.body, password:createHashPassword});

    res.status(201).json({email: newUser.email, subscription: newUser.subscription});
};

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id,
    }
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "5d"});
    await User.findByIdAndUpdate(user._id, {token});
    

    res.json({
        token,
    })
};

    const getCurrent = async(req, res) => {
        const {email, subscription} = req.user;

        res.json({
            email,
            subscription,
        })
    };

    const logout = async(req, res) => {
        const {_id} = req.user;
        const result = await User.findByIdAndUpdate(_id, {token:""});

        res.status(204, "logout success").json(result);
    }

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
};