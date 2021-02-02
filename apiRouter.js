const express = require('express')
const router = express.Router();
const TalentRepository = require('./repository/talent');

const { ResourceNotFound, ResourceValidationError } = require('./repository/errors');
const { isFacePresent } = require('./face_detection');
const multerUpload = require('./multerImageUpload');
const { uploadToS3, generateGetPresignedUrl } = require('./s3');

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
});

const uploadProfilePictureMiddleware = multerUpload.single('profile_picture')

router.use("/users", require("./controllers/users"));

router.post('/talents/', uploadProfilePictureMiddleware, async (req, res, next) => {
  try {
    const profile_picture_disk_path = req.file.path;
    const { name, description } = req.body;

    const isHuman = await isFacePresent(profile_picture_disk_path);
    if (!isHuman) {
      res.status(400).send({
        message: "Our Face Detection Service has detected a lack of humans in this picture!"
      });
      return;
    }

    const profile_picture_key = req.file.filename;
    await uploadToS3(profile_picture_disk_path, profile_picture_key);

    await TalentRepository.insert({ name, description, profile_picture_path: profile_picture_key });

    res.status(201).send();
  } catch (e) {
    next(e);
  }
});


router.put('/talents/:id', uploadProfilePictureMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile_picture_disk_path = req.file.path;
    const { name, description } = req.body;

    const isHuman = await isFacePresent(profile_picture_disk_path);
    if (!isHuman) {
      res.status(400).send({
        message: "Our Face Detection Service has detected a lack of humans in this picture!"
      });
      return;
    }

    const profile_picture_key = req.file.filename;
    await uploadToS3(profile_picture_disk_path, profile_picture_key);

    await TalentRepository.update(id, { name, description, profile_picture_path: profile_picture_key });

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.get('/talents/', async (req, res, next) => {
  try {
    const { query } = req.query;

    let talents;

    if (query) {
      talents = await TalentRepository.search(query);
    } else {
      talents = await TalentRepository.findAll();
    }

    const talentsWithS3PresignedUrl = talents.map(talent => {
      return {
        ...talent,
        profile_picture_url: generateGetPresignedUrl(talent.profile_picture_path)
      }
    })

    res.status(200).send(talentsWithS3PresignedUrl);
  } catch (e) {
    next(e);
  }
});

router.get('/talents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const talent = await TalentRepository.find(id);
    const talentWithS3PresignedUrl = {
      ...talent,
      profile_picture_url: generateGetPresignedUrl(talent.profile_picture_path)
    }
    res.status(200).send(talentWithS3PresignedUrl);

    // TODO: Fetch and attach presigned url from S3
  } catch (e) {
    next(e);
  }
})

router.delete('/talents/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await TalentRepository.delete(id);

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.use(function (err, req, res, next) {
  if (err instanceof ResourceNotFound) {
    res.status(404).send(err.responseJson);
  } else if (err instanceof ResourceValidationError) {
    res.status(400).send(err.responseJson);
  } else {
    console.error(err)
    res.status(500).send('Something broke!')
  }
})

module.exports = router;