const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, './storage')
    },
    filename : (req, file, cb) => {
        cb(null, new Date().getTime()+path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    cb(null, true)
}

const fileUpload = multer({
    storage : storage,
    fileFilter : fileFilter
}).array('file', 1)

module.exports = fileUpload