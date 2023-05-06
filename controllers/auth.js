const Jimp = require("jimp");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { HttpError, ctrlWrapper } = require("..//helpers");
const gravatar = require('gravatar');
const path = require('path');
const fs = require("fs/promises");

const {User} = require('../models/user');

require("dotenv").config();

const {SECRET_KEY} = process.env;

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');


const register = async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "This email is already in use");
    }

    const createHashPassword = await bcrypt.hash(password, 10)
    const avatarUrl = gravatar.url(email);
    const newUser = await User.create({...req.body, password:createHashPassword, avatarUrl});

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
    };

    const updateAvatar = async(req, res) => {
        const {_id} = req.user;
        const {path: tmp, originalname} = req.file;
        const filename = `${_id}_${originalname}`;
        const resultUpload = path.join(avatarsDir, filename);
        await fs.rename(tmp, resultUpload);
        const avatarUrl = path.join("avatars", filename);


        await Jimp.read(resultUpload)
        .then(img =>{
            return img 
            .resize(250, 250)
            .write(resultUpload);
        })
        .catch((err) => {
            console.error(err);
          });

          await User.findOneAndUpdate({_id, avatarUrl});
          
          res.json({
            avatarUrl,  
        })
    }

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
};