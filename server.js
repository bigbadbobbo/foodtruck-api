const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
//const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Route files
const foodtrucks = require('./routes/foodtrucks');
const fooditems = require('./routes/fooditems');
const auth = require('./routes/auth');
const users = require('./routes/users');
const foodtruckratings = require('./routes/foodtruckratings');
const userratings = require('./routes/userratings');
const usergroups = require('./routes/usergroups');
const memberships = require('./routes/memberships');
const personalorders = require('./routes/personalorders');
const personalorderitems = require('./routes/personalorderitems');
const grouporders = require('./routes/grouporders');
const groupmemberorders = require('./routes/groupmemberorders');
const groupratings = require('./routes/groupratings');
const messages = require('./routes/messages');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

//app.use(logger);

// Dev Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/foodtrucks', foodtrucks);
app.use('/api/v1/fooditems', fooditems);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/foodtruckratings', foodtruckratings);
app.use('/api/v1/userratings', userratings);
app.use('/api/v1/usergroups', usergroups);
app.use('/api/v1/memberships', memberships);
app.use('/api/v1/personalorders', personalorders);
app.use('/api/v1/personalorderitems', personalorderitems);
app.use('/api/v1/grouporders', grouporders);
app.use('/api/v1/groupmemberorders', groupmemberorders);
app.use('/api/v1/groupratings', groupratings);
app.use('/api/v1/messages', messages);

app.use('/image', express.static(process.env.FILE_UPLOAD_PATH));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
