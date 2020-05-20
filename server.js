const express = require("express");
const app = express();

app.use(express.json());
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
};

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

  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json("success");
  } else {
    res.status(400).json("error loggin in");
  }
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  db.users.push({
    id: "125",
    name: name,
    email: email,
    password: password,
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
    if (user.id == id) {
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
