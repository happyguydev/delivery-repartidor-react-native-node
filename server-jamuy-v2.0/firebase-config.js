const admin = require("firebase-admin");
const serviceAccount = require("./claveprivada.json");

var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jamuy-ab9c5-default-rtdb.firebaseio.com",
});

var defaultMessaging = defaultApp.messaging()

module.exports.defaultMessaging = defaultMessaging


