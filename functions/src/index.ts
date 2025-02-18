import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import {Request, Response} from "express";

admin.initializeApp();

const CAS_BASE_URL = "https://secure.its.yale.edu/cas";
const CAS_LOGIN_URL = `${CAS_BASE_URL}/login`;
const CAS_VALIDATE_URL = `${CAS_BASE_URL}/serviceValidate`;

export const casLogin = functions.https.onRequest(
  (req: Request, res: Response): void => {
    const casCallbackURL =
      "https://us-central1-coursematch-1cd8d.cloudfunctions.net/casCallback";
    const loginURL = `${CAS_LOGIN_URL}?service=${
      encodeURIComponent(casCallbackURL)
    }`;
    res.redirect(loginURL);
  }
);

export const casCallback = functions.https.onRequest(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ticket = req.query.ticket as string;
      if (!ticket) {
        res.status(400).send("Missing CAS ticket");
        return;
      }
      const casCallbackURL =
        "https://us-central1-coursematch-1cd8d.cloudfunctions.net/casCallback";
      const validateURL = `${CAS_VALIDATE_URL}?service=${
        encodeURIComponent(casCallbackURL)
      }&ticket=${encodeURIComponent(ticket)}`;
      const response = await axios.get(validateURL);
      const responseData = response.data;
      console.log("CAS validate response:", responseData);

      // Extract CAS user ID (NetID)
      const userRegex = /<cas:user>([^<]+)<\/cas:user>/;
      const match = responseData.match(userRegex);
      if (!match) {
        res.status(401).send("CAS validation failed");
        return;
      }
      const netId = match[1];

      // Create a custom token for the user
      const customToken = await admin.auth().createCustomToken(netId, {
        casUser: netId,
      });

      // Check if the user already exists in Firestore
      const userDocRef = admin.firestore().doc(`users/${netId}`);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        // Generate a funky username if the user doesn't exist
        const funkyUsername = generateFunkyUsername();
        await userDocRef.set({
          netId,
          username: funkyUsername,
          createdAt: admin.firestore.Timestamp.now(),
        });
      }

      const frontEndURL = "https://coursematch-1cd8d.web.app";
      res.redirect(`${frontEndURL}?token=${customToken}`);
    } catch (err) {
      console.error("CAS Callback Error", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Helper function to generate funky usernames
const generateFunkyUsername = (): string => {
  const adjectives = [
    "Funky",
    "Cool",
    "Zany",
    "Wacky",
    "Groovy",
    "Smart",
    "Clever",
    "Zesty",
  ];
  const nouns = [
    "Penguin",
    "Cactus",
    "Unicorn",
    "Robot",
    "Ninja",
    "Pirate",
    "Wizard",
    "Dragon",
    "Dinosaur",
    "Panda",
    "Koala",
    "Sloth",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}_${randomNoun}_${
    Math.floor(Math.random() * 1000)
  }`;
};
