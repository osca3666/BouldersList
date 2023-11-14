// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
app.use(express.static('public'));
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

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

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

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
  res.render("pages/register");
});

app.get("/register", (req, res) => {
    res.render("pages/register");
  });

// Register ---------------------
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash_password =  await bcrypt.hash(req.body.password, 10);

  const query1 = `select * from users where users.username = '${req.body.username}';`;

  const input_password = req.body.password;
  const input_username = req.body.username;
  const query = `INSERT INTO users (password_hash, username, email, first_name, last_name) VALUES ('${hash_password}', '${input_username}', '${req.body.email}', '${req.body.first_name}', '${req.body.last_name}') returning *;`;

  //console.log("Input password:", hash_password);
  //console.log("Input username:", input_username);

  db.any(query1)
  .then((data) => {

    console.log("Data rows: ",data);
    if(data == false)
    {
      db.one(query)
  .then((rows) => {

    console.log("Register: ",rows);
    res.redirect("/login");
  })
  .catch((err) => {
      console.log(err);
      res.redirect("/register");
    });
    }
    else
    {
      const loginMessage = "User already exists";
      res.render('pages/login', {message: loginMessage});
    }

  })
  .catch((err) => {
      console.log(err);
      res.redirect("/register");
});

  
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/business', (req, res) => {
    res.render('pages/business')
  });




// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');