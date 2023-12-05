const express = require('express'); // To build an application server or API
const app = express();
app.use(express.static('public'));
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
var bcrypt = require('bcrypt'); //  To hash passwords
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

let user = {
  password: undefined,
  username: undefined,
  id: undefined,
  
};


app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get("/", async (req, res) => {
    try {
        // Fetch service data from the database
        const servicesData = await db.any('SELECT * FROM services');

        // Render the home template with the service data
        res.render("pages/home", { servicesData });
    } catch (error) {
        console.error('Error fetching service data:', error);
        res.status(500).json({
            status: 'error',
            message: 'An internal error occurred. Please try again later.',
            error: error.message,
        });
    }
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
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('pages/register', {error: "Registration failed. Username already exists."});
  }
});


app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user_local = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user_local) {
      // User not found or incorrect password
      res.render('pages/login', {error: "Incorrect username or password. If you do not have an account, please register."});
    } else {
      const match = await bcrypt.compare(password, user_local.password);

      if (!match) {
        // Password does not match
        res.render('pages/login', {error: "Incorrect password"});
      } else {

        req.session.user = {id: user_local.user_id, username: user_local.username, password: user_local.password};
        return res.redirect('/');
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

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);


app.post('/add-service', async (req, res) => {
  try {
    const { serviceName, serviceDescription, serviceCost } = req.body;

    // Insert the new service into the services table
    const insertServiceQuery = 'INSERT INTO services (name, description, cost) VALUES ($1, $2, $3) RETURNING *;';
    const insertedService = await db.one(insertServiceQuery, [serviceName, serviceDescription, serviceCost]);

    res.status(200).json({
      status: 'success',
      message: 'Service added successfully.',
      service: insertedService,
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message,
    });
  }
});


app.get('/business-profile/:id', async (req, res) => {
  try{
    //const api_b_id = req.params.id;
    const b_id = req.params.id;
    //console.log(b_id);
    
    const businessQuery = 'SELECT * FROM business WHERE business_id = $1';
    const business_data = await db.any(businessQuery, b_id);
    //console.log(business_data);
  
    //const idQuery = 'SELECT business_id FROM business WHERE api_business_id = $1'
    //const b_id = await db.any(idQuery, api_b_id);
    
    const serviceQuery = 'SELECT * FROM services WHERE services.service_id in (SELECT service_id FROM business_to_service WHERE business_id = $1)';
    const service_data = await db.any(serviceQuery,b_id);
    const reviewsQuery = 'SELECT * FROM review WHERE business_id = $1';
    const reviews = await db.any(reviewsQuery,b_id);

    res.render('pages/business', {
      service: service_data,
      reviews: reviews,
      business: business_data
    });
  }catch (error) {
    console.error(error);
    // Handle errors
    res.render('pages/business', {
      service: [],
      reviews: [],
      error: 'Failed to fetch data'
    });
  }
});

app.get('/service/:s_id/:b_id', (req, res) => {

  const s_id = req.params.s_id;
  const b_id = req.params.b_id;
  const query = 'SELECT * FROM services WHERE service_id = $1';
  db.one(query, [s_id])
    .then((data) => {
      res.render('pages/service', {
        service: data,
        business_id: b_id
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect(`business-profile/${b_id}`);
    });
});

  app.get('/home', (req,res) => {
    res.render('pages/home');
  });


  app.get('/user-agreement', (req, res) => {
    res.render('pages/user-agreement');
  });



//   app.post('/place-order', async (req, res) => {
//     const business_id = req.body.b_id;
//     const service_id = req.body.s_id;
//     const details = req.body.details;

//     try {
//     const user = req.session.user;

//     // Fetch service details based on service_id
//     const serviceDetails = await db.one('SELECT * FROM services WHERE service_id = $1', [service_id]);

//     // If the service does not exist, insert it

//     //commented out by Jon
//     /*if (!serviceDetails) {
//       const { name, description, cost } = req.body;

//       // Insert the service into the services table
//       const insertServiceQuery = 'INSERT INTO services (name, description, cost) VALUES ($1, $2, $3) RETURNING service_id;';
//       const serviceInsertResult = await db.one(insertServiceQuery, [name, description, cost]);

//       // Update serviceDetails with the newly inserted service
//       serviceDetails = { ...req.body, service_id: serviceInsertResult.service_id };
//     }*/

//     // Calculate total based on quantity and service cost
//     const total = serviceDetails.cost;

//     // Insert order details
//     const orderDetailsQuery = 'INSERT INTO order_details (user_id, total, status) VALUES ($1, $2, $3) RETURNING order_id;';
//     const orderInsertResult = await db.one(orderDetailsQuery, [user.id, total, 'Pending']);
//     console.log(orderInsertResult);
//     // Insert order items
//     /*const orderItemsQuery = 'INSERT INTO order_items (order_id, service_id, quantity, total) VALUES ($1, $2, $3, $4);';
//     const itemTotal = quantity * serviceDetails.cost;
//     await db.none(orderItemsQuery, [orderInsertResult.order_id, serviceDetails.service_id, quantity, itemTotal]);
//     */
//     res.redirect(`/service/${service_id}/${business_id}`);
   
//     //Commented out by Jon
//     //I think there may be a way to pass a status with res.redirect
//     //but changing the status after res.redirect causes an error :(
//     /*res.status(200).json({
//       status: 'success',
//       message: 'Order placed successfully.',
//       order: orderInsertResult,
//     });*/
    
//   } catch (error) {
//     console.error('Error placing order:', error);
    
//     /*res.status(500).json({
//       status: 'error',
//       message: 'An internal error occurred. Please try again later.',
//       error: error.message,
//     });*/
//     res.redirect(`/service/${service_id}/${business_id}`);
    
//   }
// });

app.post('/place-order', async (req, res) => {
  const business_id = req.body.b_id;
  const service_id = req.body.s_id;
  const details = req.body.details;

  try {
    const user = req.session.user;

    const businessDetails = await db.one('SELECT * FROM business WHERE business_id = $1', [business_id]);
    // Fetch service details based on service_id
    const serviceDetails = await db.one('SELECT * FROM services WHERE service_id = $1', [service_id]);

    // Calculate total based on quantity and service cost
    const realname = businessDetails.name;
    const total = serviceDetails.cost;
    const businessname = serviceDetails.name;
    const servicedesc = serviceDetails.description;

    // Insert order details
    const orderDetailsQuery = `
      INSERT INTO order_details (user_id, business_id, realname, businessname, servicedesc, total, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING order_id;
    `;

    const orderInsertResult = await db.one(orderDetailsQuery, [user.id, business_id, realname, businessname, servicedesc, total, 'Pending']);

    res.redirect(`/service/${service_id}/${business_id}`);
  } catch (error) {
    console.error('Error placing order:', error);
    res.redirect(`/service/${service_id}/${business_id}`);
  }
});



  app.get('/logout', (req, res) =>{
    req.session.destroy();
    res.render('pages/login', {message: "Logged out successfully"});
  });
  
//    app.get('/discover', (req, res) => {
//    const serviceType = req.query.type || 'service';
//    axios({
//      url: `https://local-business-data.p.rapidapi.com/search`,
//      method: 'GET',
//      dataType: 'json',
//      headers: {
//        'X-RapidAPI-Key': process.env.API_KEY,
//        'X-RapidAPI-Host': 'local-business-data.p.rapidapi.com'
//      },
//      params: {
//        
//        query: '${serviceType} in Boulder, Colorado',
//        lat: '40.0150',
//        lng: '-105.2705',
//        zoom: '10',
//        limit: '4',
//        language: 'en',
//        region: 'us'
//      },
//    })
//      .then(results => {
//      console.log(results.data); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
//      res.render('pages/discover', {events : results.data.data});
//      })
//      .catch((err) => {
//      // Handle errors
//      console.log(err);
//      res.render('pages/discover', { events: [], error: 'Failed to fetch local businesses' });
//      });
//  });



app.get('/discover', async (req, res) => {
  try {
    const page = req.query.page || 1;  // Get the page from query parameters
    const pageSize = 8;  // Number of businesses per page

    // Fetch total number of businesses
    const totalBusinessesQuery = 'SELECT COUNT(*) FROM business';
    const totalBusinesses = await db.one(totalBusinessesQuery, [], (a) => +a.count);

    // Calculate total pages
    const totalPages = Math.ceil(totalBusinesses / pageSize);

    const offset = (page - 1) * pageSize;

    // Retrieve selected business type filter
const businessTypeFilter = req.query.businessType || ''; // Assuming businessType is passed in the query

// Modify the business query based on the filter
let businessQuery;
let businessQueryParams;

if (businessTypeFilter) {
  businessQuery = 'SELECT * FROM business WHERE type = $1 LIMIT $2 OFFSET $3';
  businessQueryParams = [businessTypeFilter, pageSize, offset];
} else {
  businessQuery = 'SELECT * FROM business LIMIT $1 OFFSET $2';
  businessQueryParams = [pageSize, offset];
}

    const businesses = await db.any(businessQuery, businessQueryParams);

    //console.log(businesses);  // Log the data to the console
    res.render('pages/discover', { businesses, currentPage: page, totalPages });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message,
    });
  }
});


app.get('/addbusiness',(req, res) => {
  res.render('pages/addbusiness');
});


 app.get('/profile', async (req, res) => {
  try {
    const user = req.session.user;

    const orderDetailsQuery = 'SELECT * FROM order_details WHERE user_id = $1;';
    const orderDetails = await db.any(orderDetailsQuery, [user.id]);

    console.log('Order Details:', orderDetails);

    const orderItemsQuery = 'SELECT * FROM order_items WHERE order_id = $1;';
    for (const order of orderDetails) {
      order.items = await db.any(orderItemsQuery, [order.order_id]);
      console.log(`Order Items for Order ID ${order.order_id}:`, order.items);
    }

    res.render('pages/profile', {user: user, orders: orderDetails });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      status: 'error',
      message: 'An internal error occurred. Please try again later.',
      error: error.message,
    });
  }
});

app.get('/submit-review', (req, res) => {
  const businessId = req.query.businessId;
  res.render('pages/submit-review', {
      businessId: businessId
  });
});

app.post('/submit-review', (req, res) => {
  const { businessId, rating, reviewText } = req.body;
  console.log("Rating received:", rating);
  console.log ("Review Text:", reviewText);
  const userId = req.session.user.id;
  console.log("User ID:", userId);


  if (!businessId) {
    return res.status(400).send('Business ID is required.');
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).send('Rating must be between 1 and 5.');
  }

  const query = `SELECT * FROM business WHERE business_id = $1`;
  
  db.any(query, [businessId])
    .then((data) => {
      if (data.length === 0) {
        return res.status(404).send('Business not found.');
      }

      const insertQuery = `INSERT INTO review (business_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *;`;

      db.any(insertQuery, [
        businessId,
        userId,
        rating,
        reviewText
      ])
      .then((data) => {
        res.redirect('/business-profile/' + businessId);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error occurred while adding review.');
      });

    })
    .catch((err) => {
      console.error("Error occurred while adding review: ", err);
      res.status(500).send(`Error occurred while adding review: ${err.message}`);
    });    
});


app.get('/businessadd', (req,res) => {
  res.render('pages/addbusiness')
});

app.get('/category/1', (req,res) => {
  res.render('pages/interior')
});

app.get('/category/2', (req,res) => {
  res.render('pages/exterior')
});

app.get('/category/3', (req,res) => {
  res.render('pages/lawnandgarden')
});

app.get('/get_reviews', (req, res) => {
  const query = `SELECT r.*, u.username FROM review r INNER JOIN users u ON r.user_id = u.user_id`;

  db.any(query)
      .then((data) => {
          // Send the data back to the client
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send("Error occurred, failed to fetch reviews");
      });
});


app.get('/get_ratings', (req, res) => {
  const query = `SELECT rating FROM review WHERE rating BETWEEN 1 AND 5`;

  db.any(query)
      .then((data) => {
          res.json(data);
      })
      .catch((err) => {
          console.log(err);
          res.status(500).send("Error occurred, failed to fetch ratings");
      });
});




// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
