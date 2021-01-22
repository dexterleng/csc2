const express = require('express')
const router = express.Router()

const multer  = require('multer')
const storage = multer.diskStorage({
  destination: './uploads/',
});

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
})

// taken from https://stackoverflow.com/a/60408823/10390454
const talentMulterMiddleware = multer({
  storage: storage,
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
}).single('talent');

router.post('/talents/', talentMulterMiddleware, async (req, res, next) => {
  try {
    const profilePicture = req.file;
    const { name, description } = req.body;
  } catch (e) {
    next(e);
  }
});

module.exports = router;