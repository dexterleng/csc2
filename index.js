const express = require('express');
const viewRouter = require('./viewRouter');
const apiRouter = require('./apiRouter');
const app = express();

app.set('view engine', 'ejs');
app.use(viewRouter);
app.use('/api', apiRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})