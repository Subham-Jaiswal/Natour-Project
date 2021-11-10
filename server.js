/* eslint-disable import/no-dynamic-require */
// Starting the server
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', err => {
  // Process means Full code any where
  console.log(err.name, err.message);
  console.log(err);
  console.log('UNHANDLES uncaughtException ');
  process.exit(1);
});

let DB = process.env.DATABASE.replace(
  /<PASSWORD>/g,
  process.env.DATABASE_PASSWORD
);
DB = DB.replace('#', '%23');
console.log(DB);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  // eslint-disable-next-line prettier/prettier
  // eslint-disable-next-line no-unused-vars
  .then(con => {
    console.log('DB CONNECTED');
  })
  .catch(err => {
    console.log(err);
  });

const application = require(`${__dirname}/app`);
const port = process.env.Port;
const server = application.listen(port, () => {
  console.log('App running');
});

// get  update 200 , post 201 , error 404 , delete 204 --> data also null  ,full json object mention a length property

process.on('unhandledRejection', err => {
  console.log(err);
  console.log(err.name, err.message);
  console.log('UNHANDLES jsdgdvsgv ');
  server.close(() => {
    process.exit(1);
  });
});
