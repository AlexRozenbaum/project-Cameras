const mongoose = require('mongoose');
const Joi = require('joi')

const camerasSchema = new mongoose.Schema({
    company: String,
    info: String,
    model: String,
    sensor: String,
    resolution: String,
    price: Number,
    img: String,
    user_id: String,
    category_id: {
        type: String,
        default: "0"
    },
    date_created: {
        type: Date,
        default: Date.now()
    }

})

exports.CameraModel = mongoose.model("cameras", camerasSchema);

exports.validateCamera = (_reqBody) => {
    let schemaJoi = Joi.object({
        company: Joi.string().min(2).max(99).required(),
        info: Joi.string().min(2).max(999).required(),
        model: Joi.string().min(2).max(99).required(),
        sensor: Joi.string().min(2).max(9999).required(),
        resolution: Joi.string().min(2).max(9999).required(),
        price: Joi.number().min(2).max(99999).required(),
        img: Joi.string().min(2).max(500).allow(null, ""),
        category_id: Joi.string().min(2).max(500).allow(null, "")
    })
    return schemaJoi.validate(_reqBody);
}