
const express = require('express'); // To build an application server or API
const app = express();
app.use(express.static('public'));
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/register", (req, res) => {
    res.render("pages/register");
  });
// Register
app.post('/register', async (req, res) => {

    const password = req.body.password;
    const hash = await bcrypt.hash(password, 10);
    const username = req.body.username;

    const query = "INSERT INTO users(username, password) VALUES($1, $2);";
    const values = [username, hash];
    db.none(query,values);

    res.redirect("/login");
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.redirect('/register');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new Error('Incorrect username or password');
    }

    req.session.user = user;
    await req.session.save();

    res.redirect('/discover');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', { error: 'Incorrect username or password or an internal error occurred' });
  }
});

app.get('/business', (req, res) => {
    res.render('pages/business')
  });

  app.get('/home', (req,res) => {
    res.render('pages/home');
  });



// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');