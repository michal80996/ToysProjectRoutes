const express = require("express");
const bcrypt = require("bcrypt");

const { auth } = require("../middleweres/auth");
const { ToysModel, validateToys } = require("../models/toyModel")
const jwt = require("jsonwebtoken");

const router = express.Router();


router.get("/toysList", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 10) || 20;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await ToysModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

})



router.get("/toysList/search", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "price"
  let reverse = req.query.reverse == "yes" ? -1 : 1;
  try {
    let minPrice = req.query.min;
    let maxPrice = req.query.max;
    if (minPrice && maxPrice) {
      let data = await ToysModel.find({ $and: [{ price: { $gte: minPrice } }, { price: { $lte: maxPrice } }] })

        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);
    }
    else if (maxPrice) {
      let data = await ToysModel.find({ price: { $lte: maxPrice } })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);
    } else if (minPrice) {
      let data = await ToysModel.find({ price: { $gte: minPrice } })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);
    } else {
      let data = await ToysModel.find({})
        .limit(perPage)
        .skip((page - 1) * perPage)
        .sort({ [sort]: reverse })
      res.json(data);
    }
  }

  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }

})

router.get("/toysList/searchByCat", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  try {
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS, "i")
    let data = await ToyModel.find({ $or: [{ name: searchReg }, { info: searchReg }] })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

router.get("/toysList/:name", async (req, res) => {
  try {
    let name = req.params.name;
    if (name) {
      let data = await ToysModel.find({ name })
      res.json(data);
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


router.post("/", auth, async (req, res) => {
  let valdiateBody = validateToys(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    let toy = new ToysModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy)
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


router.put("toysList/:idEdit", auth, async (req, res) => {
  let valdiateBody = validateToys(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }

  try {
    let data;
    let idEdit = req.params.idEdit

    if (req.tokenData.role == "admin") {
      data = await ToysModel.updateOne({ _id: idEdit }, req.body);
    } else {
      data = await ToysModel.updateOne({ _id: idEdit, user_id: req.tokenData._id }, req.body);
    }

    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


router.delete("toysList/:idDel", auth, async (req, res) => {
  try {
    let idDel = req.params.idDel;
    let data;

    if (req.tokenData.role == "admin") {
      data = await ToysModel.deleteOne({ _id: idDel })
    } else {
      data = await ToysModel.deleteOne({ _id: idDel, user_id: req.tokenData._id })
    }
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;
