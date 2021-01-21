const express = require('express');
const apiRouter = require('./apiRouter');
const app = express();

app.use(express.static('public'));

app.use('/api', apiRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})