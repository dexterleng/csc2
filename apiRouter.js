const aws = require('aws-sdk');
const express = require('express')
const router = express.Router();
const path = require('path');
const TalentRepository = require('./repository/talent');

const multer  = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3({});

const S3_BUCKET = 'test';

const s3Storage = multerS3({
  s3: s3,
  bucket: S3_BUCKET,
  metadata: function (req, file, cb) {
    cb(null, {fieldName: file.fieldname});
  },
  key: function (req, file, cb) {
    cb(null, './talents/' + Date.now().toString())
  }
});

<<<<<<< HEAD
/**
 * @swagger
 * /healthcheck:
 *      get:
 *          summary: Checks health of server
 *          description: Checks whether the api server is healthy
 *          responses:
 *              200:
 *                  description: Server is healthy
 *                  content:
 *                      text/html:
 *                          schema:
 *                              type: string
 *                          examples:
 *                              default:
 *                                  value: API Healthy
 */
router.use('/healthcheck', function (req, res, next) {
    res.status(200).send('API Healthy');
=======
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

router.get('/healthcheck', function (req, res, next) {
  res.status(200).send('API Healthy');
>>>>>>> create repository; talent apis
})

// taken from https://stackoverflow.com/a/60408823/10390454
const talentMulterMiddleware = multer({
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
      cb('Error: Images Only!');
    }
  }
}).single('profile_picture');


router.post('/talents/', talentMulterMiddleware, async (req, res, next) => {
  try {
    const profile_picture_path = req.file.path;
    const { name, description } = req.body;

    // TODO: validate if human with Clarifai
    // Create disque id

    await TalentRepository.insert({ name, description, profile_picture_path });

    // TODO: index image with algolia
    res.status(201).send();
  } catch (e) {
    next(e);
  }
});

router.get('/talents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const talent = await TalentRepository.find(id);
    res.status(200).send(talent);

    // TODO: Fetch and attach presigned url from S3
  } catch (e) {
    next(e);
  }
})

router.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

module.exports = router;