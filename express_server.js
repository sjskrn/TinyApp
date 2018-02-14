const express = require("express");
// const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser');
const app = express();
const cookieSession = require('cookie-session');
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'dev']
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

let templateVars = {
  urlDatabase: urlDatabase,
  username: null
};

console.log('templateVars:', templateVars);
console.log('user:', users);

function doesUserEmailExist(email) {
  for (let user in users) {
    if (users[user]['email'] === email) {
    return true;
    }
  }
  false;
}

function isUserPasswordValid(password) {
  for (let user in users) {
    console.log('users[user]["password"]: ', users[user]['password']);
    if (users[user]['password'] === password) {
    console.log('isUserPasswordValid: ', password);
    return true;
    }
  }
  false;
}

const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
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
  let templateVars = { urlDatabase: urlDatabase, username: users[req.session.user_id]};
  if (userChecker(req.session.user_id)) {
    res.render('urls_index', templateVars);
  } else {
    res.render('login', templateVars);
  }
});

app.get("/register", (req, res) => {
  if (doesUserEmailExist(req.session.user_id)) {
    res.redirect('/');
  } res.render('register');
});

app.post("/register", (req, res) => {
  console.log("Post params ", req.body);
  if ((req.body.email === '') || (req.body.password === ''))
    return res.status(400).send("Please enter a valid email and/or password");
  else if (doesUserEmailExist(req.body.email) === false)
    return res.status(400).send("User already exists!");
  else {
    let newUserKey = generateRandomString();
    users[newUserKey] = {};
    users[newUserKey].id = newUserKey;
    users[newUserKey].email = req.body.email;
    users[newUserKey].password = req.body.password;
    res.cookie('user_id', newUserKey);
    req.session['user_id'] = newUserKey;
    return res.redirect("/");
  }
});

app.get("/login", (req, res) => {
let userId = req.session.user_id;
  if (userId in users) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  for (user in users) {
    if (users[user].email === req.body.email && users[user].password ===req.body.password) {
      req.session.user_id = users[user].id;
      res.redirect('/');
      return;
    }
  }
  res.status(403).send('Username and/or Password do not match');
});

app.post("/logout", (req, res) => {
  // res.clearCookie('username')
  // res.clearCookie('password')
  res.clearCookie('session'); 
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  console.log('req.session.user_id: ', req.session.user_id);
  if (userChecker(req.session.user_id)) {
    let templateVars = {urlDatabase: urlDatabase, username: users[req.session.user_id]};
    console.log('new templateVars: ', templateVars);
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/"> Login </a>');
  }
});

app.get("/urls/new", (req, res) => {
  if (userChecker(req.session.user_id)) {
    let templateVars = {urlDatabase: urlDatabase, username: users[req.session.user_id]};
    res.render("urls_new", templateVars);
    res.redirect("urls_index");
  } else {
    res.status(401).send('Error: 401: You are not authorized, Please <a href="/"> Login </a>');
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {urlDatabase: urlDatabase, username: users[req.session.user_id]};
  let shortUrl = req.params.id;
  let longUrl = urlDatabase[shortUrl];
  templateVars.shortUrl = shortUrl;
  templateVars.longUrl = longUrl;
  console.log("This is what app.get for urls/:id gives the following for urlDatabase[req.params.id]: " + urlDatabase[req.params.id] + "shortUrl: " + req.params.id);
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