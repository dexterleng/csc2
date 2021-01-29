require('dotenv').config();

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const viewRouter = require('./viewRouter');
const apiRouter = require('./apiRouter');

const options = {
    swaggerDefinition: require("./swaggerDefinition"),
    apis: ["./*.js"]
}

const swaggerSpec = swaggerJSDoc(options);

const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRouter);
app.set('view engine', 'ejs');
app.use(viewRouter);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
