const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1", // localhost
    user: "michaelzamudio",
    password: "",
    database: "janus",
  },
});

const app = express();
app.use(express.json());
app.use(cors());

/*
THE PLAN

/ --> res = this is working
/signin --> POST = success or fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/

app.get("/", (req, res) => {
  res.send("working");
});

app.post("/signin", (req, res) => {
  /*

    We want to check whatever the user enters on the front-end – it's going to come back here in the response or in the request and we want to check it with our current list of users to make sure that their passwords match.

  */

  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("unable to retrieve user"));
      } else {
        res.status(400).json("wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("wrong credentials"));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  // Store hash in your password DB.
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return db("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable sign up"));
});

// future build out on front end -- user profile
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("not found");
      }
    })
    .catch((err) => res.status(400).json("error retrieving user"));
});

// updates entry count for user
app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json("unable to retrieve entries"));
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`app is running on port ${process.env.PORT}`);
});
