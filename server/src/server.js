require('dotenv').config();
require('express-async-errors');

const app = require('./app');
const connectDB = require('./config/db');
const { startEscalationJob } = require('./jobs/escalationJob');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  startEscalationJob();
};

startServer();
