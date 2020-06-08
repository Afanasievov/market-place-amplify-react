/* Amplify Params - DO NOT EDIT
  API_MARKETPLACEAMPLIFYRE_GRAPHQLAPIENDPOINTOUTPUT
  API_MARKETPLACEAMPLIFYRE_GRAPHQLAPIIDOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

require('dotenv').config();
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const {
  AWS_REGION,
  AMPLIFY_ACCESS_KEY_ID,
  AMPLIFY_SECRET_ACCESS_KEY,
  AWS_SES_ENDPOINT,
  ADMIN_EMAIL,
} = process.env;
const config = {
  accessKeyId: AMPLIFY_ACCESS_KEY_ID,
  secretAccessKey: AMPLIFY_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  endpoint: AWS_SES_ENDPOINT,
};

const sesv2 = new AWS.SESV2(config);

const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const chargeHandler = async (req, res, next) => {
  const { token } = req.body;
  const { currency, amount, description, shipped } = req.body.charge;

  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    });

    if (charge.status === 'succeeded') {
      req.charge = charge;
      req.shipped = shipped;
      req.description = description;
      next();
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const emailHandler = async (req, res) => {
  const { charge, shipped, description } = req;
  const { token } = req.body;
  const params = {
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `<p>Order Details</p>
            <div>Amount: ${(charge.amount / 100).toFixed(2)} ${charge.currency}</div>
            <div>Shipped: ${shipped}</div>
            <div>Description: ${description}</div>
            <div>Email: ${token.email}</div>
            `,
          },
        },
        Subject: {
          Data: 'Order processed!',
        },
      },
    },
    Destination: {
      ToAddresses: [ADMIN_EMAIL],
    },
    FromEmailAddress: ADMIN_EMAIL,
  };

  return sesv2
    .sendEmail(params)
    .promise()
    .then((data) => res.json({ data }))
    .catch((error) => res.status(500).json({ error }));
};

app.post('/mp/charge', chargeHandler, emailHandler);

app.listen(port);

module.exports = app;
