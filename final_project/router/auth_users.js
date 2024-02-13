const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userWithSameName = users.filter((user) => {
    return user.username === username;
  });
  if (userWithSameName.length > 0) {
    return false;
  } else {
    return true;
  }
};
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = { accessToken, username };
    console.log(req.session);
    return res.status(200).send("User successfully logged in");
  } else {
    res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.query.review;
  let book = books[isbn];
  if (book) {
    book.reviews[username] = review;
    books[isbn] = book;
    return res.send(`Review is successfully added by ${username}`);
  }
  return res.status(404).json({ message: "Error!" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    delete book.reviews[username];
    books[isbn] = book;
    return res.send(`Your review is successfully deleted`);
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
