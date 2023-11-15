
const express = require('express'); // To build an application server or API
const app = express();
app.use(express.static('public'));
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
var bcrypt = require('bcryptjs'); //  To hash passwords
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

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/register", (req, res) => {
    res.render("pages/register");
  });

// Register ---------------------
app.post('/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const username = req.body.username;

    const query = 'INSERT into users (username, password) values ($1, $2) returning *;';
    const data = await db.one(query, [username, hash]);

    console.log(data);
    console.log("test");

    res.status(200).json({
      status: 'success',
      message: 'User registered successfully.',
      user: data  // Include the registered user data in the response if needed
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'error',
      message: 'Registration failed. Please try again.',
      error: err.message  // Include the error message in the response
    });
  }
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
      // User not found or incorrect password
      res.status(400).json({
        status: 'error',
        error: 'Incorrect username or password. If you do not have an account, please register.'
      });
    } else {
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        // Password does not match
        res.status(400).json({
          status: 'error',
          error: 'Incorrect username or password. If you do not have an account, please register.'
        });
      } else {
        res.status(200).json({
          status: 'success',
          message: 'Welcome!',
          user: user  // Include the user data in the response if needed
        });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message  // Include the error message in the response
    });
  }
});




app.get('/business', (req, res) => {
    res.render('pages/business')
  });

  app.get('/home', (req,res) => {
    res.render('pages/home');
  });


  app.get('/user-agreement', (req, res) => {
    res.render('pages/user-agreement');
  });

  app.get('/profile', (req,res) => {
    //profile
    res.render('pages/profile');
  });

  app.get('/logout', (req, res) =>{
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
  
app.get('/discover',(req, res) => {
    res.render('pages/discover');
});


// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
