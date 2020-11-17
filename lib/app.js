const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const request = require('superagent');
const { mungeLocation } = require('../utils.js');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
// const favorites = require('../data/favorites.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

// Routes for favorites locations
app.get('/api/favorites', async(req, res) => {
  try {
    const data = await client.query('SELECT * from favorites WHERE favorites.owner_id = $1', [req.userId]);

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.post('/api/favorites', async(req, res) => {
  try {

    const newName = req.body.name;
    const newLat = req.body.lat;
    const newLng = req.body.lng;
    const newAddress = req.body.address;
    const newOwnerId = req.userId;

    const data = await client.query(`INSERT into favorites (name, lat, lng, address, owner_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING * `,
    [newName, newLat, newLng, newAddress, newOwnerId]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/favorites/:id', async(req, res) => {
  try {

    const favoriteId = req.params.id;

    const data = await client.query(`
    DELETE from favorites WHERE favorites.owner_id=$1 AND favorites.id=$2`,
    [req.userId, favoriteId]);

    res.json(data.rows[0]);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

// Routes for transportation modes

app.get('/api/spin', async(req, res) => {
  try {
    const URL = 'https://web.spin.pm/api/gbfs/v1/portland/free_bike_status';

    const response = await request.get(URL);

    res.json(response);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/lime', async(req, res) => {
  //sample request http://localhost:7890/api/lime?lat=45.523&lon=-122.680
  try {
    const URL = 'https://data.lime.bike/api/partners/v1/gbfs/portland/free_bike_status';

    const response = await request.get(URL);
    
    const mungedResponse = JSON.parse(response.text).data.bikes;
    const filteredArray = [];
    
    //Use 0.003degrees as 300m in lat/long coordinates alchemy coords 45.5233858, -122.6809206
    mungedResponse.map(oneScoot => {
      if(Number(oneScoot.lat) < (Number(req.query.lat) + 0.003) && Number(oneScoot.lat) > (Number(req.query.lat) - 0.003) && Number(oneScoot.lon) < (Number(req.query.lon) + 0.003) && Number(oneScoot.lon) > (Number(req.query.lon) - 0.003)) {
        const filteredObj = {};
        filteredObj.lat = oneScoot.lat;
        filteredObj.lon = oneScoot.lon;
        filteredArray.push(filteredObj);
      }
    });
    res.json(filteredArray);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/nike', async(req, res) => {
  try {
    const URL = 'https://gbfs.biketownpdx.com/gbfs/en/free_bike_status.json';

    const response = await request.get(URL);

    res.json(response);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/trimet', async(req, res) => {
  try {
    const URL = `https://developer.trimet.org/ws/V1/stops?appID=${process.env.TRIMET_APP_ID}&ll=${req.query.lat},${req.query.lng}&feet=1000`;

    const response = await request.get(URL);

    res.json(response);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});


// Route to retrieve lat and lng of address

app.get('/api/location', async(req, res) => {
  try {
    const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.LOCATION_IQ_KEY}&q=${req.query.search}&format=json`;

    const response = await request.get(URL);
    const newResponse = mungeLocation(response.body);

    res.json(newResponse);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
