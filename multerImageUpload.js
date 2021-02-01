const multer  = require('multer');
const path = require('path');

// const s3Storage = multerS3({
//   s3: s3,
//   bucket: S3_BUCKET,
//   metadata: function (req, file, cb) {
//     cb(null, {fieldName: file.fieldname});
//   },
//   key: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, file.fieldname + '-' + uniqueSuffix)
//   }
// });

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

// taken from https://stackoverflow.com/a/60408823/10390454
module.exports = multer({
  storage: diskStorage,
  limits: {
    fieldSize: 1048576
  },
  fileFilter: function(req, file, cb){
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
      return cb(null,true);
    } else {
      const e = new ResourceValidationError();
      cb(e, null);
    }
  }
})
