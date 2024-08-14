const mongoose = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const admin = new Schema({
    // credentials
    email : { type : String, unique : true },
    password : { type : String },
    // specifications
    fullname : { type : String },
    contact: { type: String },
    // customize
    avatar : [],
    role : {
        type : String,
        default: "ADMIN"
    },
    // mod
    date_created : { type : Date, default : Date.now },
    date_modified : { type : Date, default : Date.now },
    refreshToken : { type : String },
    refreshTokenDate : { type : Date },
    status : {
        type : String,
        default : "ACTIVE"
    }
})

admin.plugin(mongoosePaginate)

module.exports = {
    admin : mongoose.model("admin",admin)
}