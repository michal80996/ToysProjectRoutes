const express = require("express");
const bcrypt = require("bcrypt");
const { auth , authAdmin} = require("../middleweres/auth");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel")
const jwt = require("jsonwebtoken");
// const { config } = require("dotenv");
const {config} = require("../config/secret")


const router = express.Router();


router.get("/usersList" , authAdmin,  async(req,res) => {
  try{
    
    let data = await UserModel.find({},{password:0});
    res.json(data)
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }  
})


router.get("/myEmail", auth, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.tokenData._id }, { email: 1 })
    res.json(user);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.get("/myInfo", auth ,async (req, res) => {

  let token = req.header("x-api-key");
  if (!token) {
    return res.status(401).json({ msg: "You need to send token to this endpoint url" })
  }
  try {
    let tokenData = jwt.verify(token, config.tokenSecret);

    let user = await UserModel.findOne({ _id: tokenData._id }, { password: 0 });
    res.json(user);

  }
  catch (err) {
    return res.status(401).json({ msg: "Token not valid or expired" })
  }

})

router.post("/", async (req, res) => {
  let validBody = validUser(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);

    user.password = await bcrypt.hash(user.password, 10);

    await user.save();
    user.password = "*****";
    res.status(201).json(user);
  }
  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "Email already in system, try log in", code: 11000 })

    }
    console.log(err);
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "Password or email is worng ,code:1" })
    }

    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "Password or email is worng ,code:2" });
    }

    let newToken = createToken(user._id , user.role);
    res.json({ token: newToken });
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;