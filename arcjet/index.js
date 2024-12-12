import express from "express"; // For ESM module format

import arcjet, { validateEmail } from "@arcjet/node";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 4000;
const users = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "himanshipatel",
    saveUninitialized: true,
    cookie: { secure: false },
    resave: false,
  })
);

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

const displayEmails = (req, res) => {
  users.forEach((user) => {
    console.log("Registered User!");
    console.log(user.email);
  });
};

app.post("/sign-up", async (req, res) => {
  try {
    const { email, password } = req.body;

    const descision = aj.protect(req, {
      email: req.body.email,
    });
    console.log("Arcjet descision", descision);
    if ((await descision).isDenied()) {
      res.status(400).json("Invalid email address");
    }
    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }
    if (users.find((user) => user.email === email)) {
      return res.status(400).json("User already exists");
    }
    users.push({ email, password });
    req.session.email = email;
    displayEmails(req, res);
    res.status(201).send("User created");
  } catch (error) {
    console.log("Error signing user", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
