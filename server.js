require('dotenv').config()
const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose");

// const fs = require('fs');
// const http = require('http');
// const https = require('https');

const app = express();
app.use(cors());
// app.use("/images", express.static("images"));

const port = process.env.PORT || 4000;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(express.json());
app.use(logger)

app.get('/', (req, res) => {
  res.send('Welcome')
})

const userRoutes = require('./routes/userRoutes')
const foodRoutes = require('./routes/foodRoutes')
const restaurantRoutes = require('./routes/restaurantRoutes')
const driverRoutes = require('./routes/driverRoutes')
const adminRoutes = require('./routes/adminRoutes')
const rideRoutes = require('./routes/rideRoutes') 
const messengerRoutes = require('./routes/messengerRoutes')
const bikerRoutes = require('./routes/bikerRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

app.use('/api/user', userRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/driver', driverRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/messenger',messengerRoutes)
app.use('/api/biker',bikerRoutes)
app.use('/api/ride', rideRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/payment', paymentRoutes)


const http = require('http');
const httpServer = http.createServer(app);

const socket = require('./socket')
socket.init(httpServer);


// app.unsubscribe(cors());
// Certificate
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/elitewater-admin.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/elitewater-admin.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/elitewater-admin.com/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };

// Starting both http & https servers
// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

// httpServer.listen(3000, () => {
// 	try {
//     mongoose.connect(process.env.MONGODB_URL,() => {
//       console.log("Connected to db successfully");
//     });

//   } catch (error) {
//     console.log(error);
//   }
//   console.log(`App is Running on PORT 3000`);
// });

// httpsServer.listen(4001, () => {
// 	try {
//     mongoose.connect(process.env.MONGODB_URL,() => {
//       console.log("Connected to db successfully");
//     });

//   } catch (error) {
//     console.log(error);
//   }
//   console.log(`App is Running on PORT 4001`);
// });

httpServer.listen(port, async () => {
  try {
    mongoose.connect(process.env.MONGODB_URL ,() => {
      console.log("Connected to db successfully");
    });

  } catch (error) {
    console.log(error);
  }
  console.log(`App is Running on PORT ${port}`);
});

function logger(req, res, next) {
  console.log(req.originalUrl) 
  next()
} 
 
