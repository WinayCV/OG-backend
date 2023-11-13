require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const configDB = require('../config/db');
configDB();
const socketIo = require('socket.io');
const {createServer} = require('http');
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // or the origin you want to allow
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});
require('../config/startAuction.js')(io);
// const startAuction = require("../config/startAuction");
const {checkSchema} = require('express-validator');
const {
  userRegisterationSchema,
  userLoginSchema,
  userAdminSchema,
  userProfileEditSchmea,
} = require('../helpers/user-Validation');
const artworkCltr = require('../controllers/artwork-cltr');
const userCltr = require('../controllers/user-cltr');
const {
  authenticateUser,
  authorizeUser,
} = require('../middlewares/authenticate');
const {
  artworkValidationSchema,
  artworkEditSchema,
} = require('../helpers/artwork-validation');
const multer = require('multer');
const auctionCltr = require('../controllers/auctionCltr');
const {
  auctionValidationSchema,
  bidSchemaValidation,
} = require('../helpers/auction-validation');
const addressValidationSchema = require('../helpers/address-validation');
const addressCltr = require('../controllers/address-Cltr');
const paymentCltr = require('../controllers/payment-Cltr');
const port = process.env.PORT;

//multer configurataion

const upload = multer();

//user

app.post(
  '/og/register',
  checkSchema(userRegisterationSchema),
  userCltr.register
);
app.get('/og/verifyEmail/:token', userCltr.verify);
app.post('/og/login', checkSchema(userLoginSchema), userCltr.login);
app.get('/og/getProfile', authenticateUser, userCltr.account);
app.put(
  '/og/editProfile',
  authenticateUser,
  checkSchema(userProfileEditSchmea),
  userCltr.edit
);
app.get('/og/allProfiles');
app.put(
  '/og/editUserPriviliges/:id',
  authenticateUser,
  authorizeUser(['admin']),
  checkSchema(userAdminSchema),
  userCltr.role
);
app.delete('/og/deleteProfile');

//Artwork- //public
app.get('/og/artwork/all', artworkCltr.all);
app.get('/og/artwork/:id', artworkCltr.one);

//Artwork- //Artist
app.post(
  '/og/artwork/create',
  authenticateUser,
  authorizeUser(['artist']),
  upload.array('files'),
  checkSchema(artworkValidationSchema),
  artworkCltr.create
);
app.get(
  '/og/artwork/list',
  authenticateUser,
  authorizeUser(['artist']),
  artworkCltr.list
);
app.put(
  '/og/artwork/edit/:id',
  authenticateUser,
  authorizeUser(['artist']),
  upload.array('newImages'),
  checkSchema(artworkEditSchema),
  artworkCltr.edit
); // sending artwork id
app.delete(
  '/og/artwork/delete/:id',
  authenticateUser,
  authorizeUser(['artist', 'admin']),
  artworkCltr.delete
);

//Auction
app.post(
  '/og/auction/create',
  authenticateUser,
  checkSchema(auctionValidationSchema),
  authorizeUser(['artist']),
  auctionCltr.create
);
app.get('/og/auction/active', auctionCltr.active);

app.delete(
  '/og/auction/delete/:id',
  authenticateUser,
  authorizeUser(['artist', 'admin']),
  auctionCltr.delete
);
// bids
app.post(
  '/og/auction/bid/:id',
  authenticateUser,
  checkSchema(bidSchemaValidation),
  auctionCltr.bid
);
app.get('/og/auction/bids', authenticateUser, auctionCltr.getBid);

// address api
app.post(
  '/og/address',
  authenticateUser,
  checkSchema(addressValidationSchema),
  addressCltr.create
);
app.delete('/og/address/:id', authenticateUser, addressCltr.delete);
app.get('/og/address/list', authenticateUser, addressCltr.list);

// payment
app.post('/og/payment', authenticateUser, paymentCltr.create);
app.post('/og/payment/:id', authenticateUser, paymentCltr.update);

//Connection to server
server.listen(port, () => {
  console.log('server running at ', port);
});
