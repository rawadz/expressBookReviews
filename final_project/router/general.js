const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (isValid(username)) {
      users.push({ username: username, password: password });
      console.log(users);
      console.log(req.session);
      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User is already exist!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}
public_users.get("/", function (req, res) {
  getBooks().then(
    (books) => res.send(JSON.stringify(books, null, 4)),
    (error) => res.send(error)
  );
});

// Get book details based on ISBN
function getBookByIsnb(isnb) {
  const book = books[isnb];
  return new Promise((resolve, reject) => {
    if (book) {
      resolve(book);
    } else {
      reject("Book is not exist!");
    }
  });
}
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getBookByIsnb(isbn).then(
    (book) => res.send(JSON.stringify(book, null, 4)),
    (error) => res.send(error)
  );
});

// Get book details based on author
function getBookByAuthor(author) {
  return new Promise((resolve, reject) => {
    let booksWithAuthor = [];
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.author == author) {
          booksWithAuthor.push(book);
        }
      }
    }
    resolve(booksWithAuthor);
  });
}
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getBookByAuthor(author).then(
    (booksWithAuthor) => res.send(booksWithAuthor),
    (error) => res.send(error)
  );
});

// Get all books based on title
function getBookByTitle(title) {
  return new Promise((resolve, reject) => {
    for (const isbn in books) {
      if (books.hasOwnProperty(isbn)) {
        const book = books[isbn];
        if (book.title == title) {
          resolve(book);
        }
      }
    }
    reject(`Book with title ${title} is not found!`);
  });
}
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBookByTitle(title).then(
    (book) => res.send(JSON.stringify(book, null, 4)),
    (error) => res.send(error)
  );
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
