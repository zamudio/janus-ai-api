const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

const db = {
  users: [
    {
      id: "123",
      name: "Johann",
      email: "johann@gmail.com",
      password: "apples",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "Sara",
      email: "sara@gmail.com",
      password: "oranges",
      entries: 0,
      joined: new Date(),
    },
  ],
  login: [
    {
      id: "987",
      hash: "",
      email: "johann@gmail.com",
    },
    {
      id: "988",
      hash: "",
      email: "sara@gmail.com",
    },
  ],
};

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
  res.send(db.users);
});

app.post("/signin", (req, res) => {
  /*

    We want to check whatever the user enters on the front-end – it's going to come back here in the response or in the request and we want to check it with our current list of users to make sure that their passwords match.

    */
  // Load hash from your password DB.
  bcrypt.compare(
    "qwerty",
    "$2a$10$GFlnWh5BZuQKYQNmiX86der7D3M0x3Od/h8TRJ2HYxu0MvivZTRqm",
    function (err, res) {
      console.log("first guess", res);
    }
  );
  bcrypt.compare(
    "not_bacon",
    "$2a$10$GFlnWh5BZuQKYQNmiX86der7D3M0x3Od/h8TRJ2HYxu0MvivZTRqm",
    function (err, res) {
      console.log("second guess", res);
    }
  );

  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json(db.users[0]);
  } else {
    res.status(400).json("error loggin in");
  }
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      // Store hash in your password DB.
      console.log(hash);
    });
  });
  db.users.push({
    id: "125",
    name: name,
    email: email,
    entries: 0,
    joined: new Date(),
  });
  // returns the newly created user
  res.json(db.users[db.users.length - 1]);
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  db.users.forEach((user) => {
    if (user.id == id) {
      found = true;
      return res.json(user);
    }
  });

  if (!found) {
    res.status(400).json("Not found");
  }
});

app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  db.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json("Not found");
  }
});

app.listen(3001, () => {
  console.log("app is running on port 3001");
});
