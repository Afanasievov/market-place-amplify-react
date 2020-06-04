/* Amplify Params - DO NOT EDIT
  API_MARKETPLACEAMPLIFYRE_GRAPHQLAPIENDPOINTOUTPUT
  API_MARKETPLACEAMPLIFYRE_GRAPHQLAPIIDOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/mp/charge', async (req, res) => {
  const { token } = req.body;
  const { currency, amount, description } = req.body.charge;

  try {
    await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(port);

module.exports = app;
