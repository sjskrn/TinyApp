const express = require("express");
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

const PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!, visit localhost:8080 in your browser`);
});

function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  return randomString;
}

app.get("/", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  };
  res.render("main", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.clearCookie('password')
  res.redirect("/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urlDatabase: urlDatabase
  };
  res.render("urls_index", templateVars); 
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("req.params:", req.params);
  console.log("urlDatabase[req.params.id] to be deleted:", urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  console.log("urlDatabase:", urlDatabase);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  console.log("Post parameters", req.body);
  console.log("Long URL is ", req.body.longUrl);
  let shortUrl = generateRandomString();
  console.log("Short URL is ", shortUrl);
  urlDatabase[shortUrl] = req.body.longUrl;
  console.log("updated URL Database?", urlDatabase);
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id", (req, res) => {
  console.log("changing the long URL for this req.params:", req.params);
  console.log("urlDatabase[req.params.id] to be changed:", urlDatabase[req.params.id]);
  console.log("updated longUrl:", req.body.longUrl);
  urlDatabase[req.params.id] = req.body.longUrl;
  console.log("urlDatabase:", urlDatabase);
  res.redirect("/urls");
});

app.get("/u/:shortUrl", (req, res) => {
  const longUrl = urlDatabase[req.params.shortUrl];
  res.redirect(longUrl);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});