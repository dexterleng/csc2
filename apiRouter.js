const express = require('express')
const router = express.Router()

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

module.exports = router;