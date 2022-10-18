const express = require("express");
const { auth } = require("../middlewares/auth");
const { CameraModel, validateCamera } = require("../models/cameraModel")
const router = express.Router();

router.get("/", async(req, res) => {
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "_id";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try {
        let data = await CameraModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            .sort({
                [sort]: reverse
            })
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/search", async(req, res) => {
    try {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS, "i")
        let data = await CameraModel.find({ $or: [{ company: searchReg }, { info: searchReg }] })
            .limit(50)
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/categories/:catName", async(req, res) => {
    let page = req.query.page || 1;
    try {
        let catName = req.params.catName;
        let data = await CameraModel.find({}).where("category_id").equals(catName).limit(10).skip((page - 1) * 10);
        res.json(data);
    } catch (err) {
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/prices", async(req, res) => {
    try {
        let min = req.query.min || 0;
        let max = req.query.max || Infinity;
        let data = await CameraModel.find({});
        let temp_ar = data.filter(item => {
            let price = Number(item.price)
            return (price >= min && price <= max)
        })
        res.json(temp_ar)
    } catch (err) {
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.post("/", auth, async(req, res) => {
    let validBody = validateCamera(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let camera = new CameraModel(req.body);
        camera.user_id = req.tokenData._id;
        await camera.save();
        res.status(201).json(camera);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})


router.put("/:editId", auth, async(req, res) => {
    let validBody = validateCamera(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    try {
        let editId = req.params.editId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await CameraModel.updateOne({ _id: editId }, req.body)
        } else {
            data = await CameraModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
        }
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

router.delete("/:delId", auth, async(req, res) => {
    try {
        let delId = req.params.delId;
        let data;
        if (req.tokenData.role == "admin") {
            data = await CameraModel.deleteOne({ _id: delId })
        } else {
            data = await CameraModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
        }
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

module.exports = router;