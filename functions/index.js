const firebase = require("firebase");
const config = {
  apiKey: "AIzaSyDj7fuR-m413SClO_dqADqKhb_6plj4Hiw",
  authDomain: "untestedcoronaheatmap.firebaseapp.com",
  databaseURL: "https://untestedcoronaheatmap.firebaseio.com",
  projectId: "untestedcoronaheatmap",
  storageBucket: "",
  messagingSenderId: "229170570386"
};
firebase.initializeApp(config);

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const accountSid = process.env.TwilioSID;
const authToken = process.env.TwilioAuthToken;
const client = require("twilio")(accountSid, authToken);
let bodyParser = require("body-parser");
// https://www.npmjs.com/package/firebase-functions-rate-limiter

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
app.use(bodyParser.urlencoded({ extended: true }));

// build multiple CRUD interfaces:
app.post("/sendVerificationCode", (req, res) => {
  return client.verify
    .services(process.env.TwilioService)
    .verifications.create({ to: req.body.phone, channel: "sms" })
    .then(verification_check =>
      res.status(200).send(verification_check.status)
    );
});

app.post("/checkVerificationCode", (req, res) => {
  return client.verify
    .services(process.env.TwilioService)
    .verificationChecks.create({ to: req.body.phone, code: req.body.code })
    .then(verification_check =>
      res.status(200).send({ verificationStatus: verification_check.status() })
    );
});

app.post("/addNewCase", (req, res) => {
  return client.verify
    .services("VAd155c60c0c61ee63b51dee671f61ab85")
    .verificationChecks.create({ to: req.body.phone, code: req.body.code })
    .then(verification_check => {
      if (verification_check.status === "approved") {
        const db = firebase.firestore();
        const userRef = db.collection("unconfirmed_cases").add({
          confirmed_phone: req.body.phone,
          lat: req.body.lat,
          lng: req.body.lng,
          timestamp: req.body.timestamp,
          short_of_breath: req.body.short_of_breath,
          headache: req.body.headache,
          runny_nose: req.body.runny_nose,
          diarrhea: req.body.diarrhea,
          cough: req.body.cough,
          body_aches: req.body.body_aches,
          congestion: req.body.congestion,
          sore_throat: req.body.sore_throat
        });

        return res.status(200).send({ message: "success" });
      } else {
        return res.status(200).send({ message: "code failure" });
      }
    });
});

// Expose Express API as a single Cloud Function:
exports.express = functions.https.onRequest(app);
