const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://cazzkaro-c8cdf.appspot.com",
});
const bucket = admin.storage().bucket();
module.exports = bucket;
