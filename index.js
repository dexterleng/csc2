require('dotenv').config();

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const viewRouter = require('./viewRouter');
const apiRouter = require('./apiRouter');
const { PORT } = require('./env_constants');

const options = {
    swaggerDefinition: require("./swaggerDefinition"),
    apis: ["./*.js"]
}

if (process.env.NODE_ENV !== "production")
{
    process.env.API_GATEWAY_URL = undefined;
}

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);
app.use('/public/', express.static('public'))
app.set('view engine', 'ejs');
app.use(viewRouter);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
