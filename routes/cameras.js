const express = require("express");
const { auth } = require("../middlewares/auth");
const { CameraModel, validateCamera } = require("../models/cameraModel")
const router = express.Router();

router.get("/", async(req, res) => {
    let perPage = req.query.perPage || 5;
    let page = req.query.page || 1;

    try {
        let data = await CameraModel.find({})
            .limit(perPage)
            .skip((page - 1) * perPage)
            // .sort({_id:-1}) like -> order by _id DESC
            .sort({ _id: -1 })
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "there error try again later", err })
    }
})

// /Camera/search?s=
router.get("/search", async(req, res) => {
    try {
        let queryS = req.query.s;
        // מביא את החיפוש בתור ביטוי ולא צריך את כל הביטוי עצמו לחיפוש
        // i -> מבטל את כל מה שקשור ל CASE SENSITVE
        let searchReg = new RegExp(queryS, "i")
        let data = await CameraModel.find({ $or: [{ company: searchReg }, { info: searchReg }] })
            .limit(50)
        res.json(data);
    } catch (err) {
        console.log(data);
        res.status(500).json({ msg: "there error try again later", err })
    }
})
router.get("/categories/:catName", async(req, res) => {
    try {
        // req.params.catName -> מכיל את הפראמס
        let catName = req.params.catName;
        let data = await CameraModel.find({});
        let temp_ar = data.filter(item => item.category_id == catName)
        res.json(temp_ar);
        // res.json({msg:"prods cats work",cat:req.params.catName})
    } catch (err) {
        res.status(500).json({ msg: "there error try again later", err })
    }
})

// לפי מינומום ומקסימום כקוארי סטרינג שיציג מוצרים
// ?min=
router.get("/prices", async(req, res) => {
    try {
        // מגדיר שהמנימום הוא מהקוארי ואם לא מוצא יהיה 0
        let min = req.query.min || 0;
        // מגדיר שהמקס הוא מהקוארי ואם לא מוצא הוא יהיה אין סופי
        let max = req.query.max || Infinity;
        // Number() -> casting-> מכריח/מלהק את המשתנה להיות מספר
        // let temp_ar = prods_ar.filter(item => Number(item.price) >= min)
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
        // add the user_id of the user that add the camera
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
        // אם אדמין יכול למחוק כל רשומה אם לא בודק שהמשתמש
        // הרשומה היוזר איי די שווה לאיי די של המשתמש
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