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
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null, true)
    }
    else{
        cb(new Error("Unsupported format"), false)
    }
}

const upload = multer({
    storage : storage,
    fileFilter : fileFilter
}).array('img', 1)

module.exports = upload