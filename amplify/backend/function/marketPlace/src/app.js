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

const convertCentsToDollars = (cents) => (cents / 100).toFixed(2);

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const chargeHandler = async (req, res, next) => {
  const {
    token,
    charge: { currency, amount, description },
  } = req.body;

  try {
    const charge = await stripe.charges.create({
      source: token.id,
      amount,
      currency,
      description,
    });

    if (charge.status === 'succeeded') {
      next();
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const emailHandler = async (req, res) => {
  const {
    email: { shipped, customerEmail, ownerEmail },
    charge: { amount, currency, description },
    token: {
      // eslint-disable-next-line camelcase
      card: { name, address_line1, address_city, address_state, address_country, address_zip },
    },
  } = req.body;
  const params = {
    Content: {
      Simple: {
        Body: {
          Html: {
            /* eslint-disable */
            Data: `
            <h3>Order Details</h3>
            <p>
              <span style="font-weight: bold">
                ${description}
              </span> - ${convertCentsToDollars(amount)} ${currency}
            </p>
            <p>
              Customer Email: <a href="mailto:${customerEmail}>${customerEmail}</a>
            </p>
            <p>
              Contact your Seller: <a href="mailto:${ownerEmail}>${ownerEmail}</a>
            </p>

            ${
              shipped
                ? `
              <h4>Mailing Address</h4>
              <p>${name}</p>
              <p>${address_line1}</p>
              <p>${address_country} ${address_city}, ${
                    address_state ? address_state : ''
                  } ${address_zip} </p>
              `
                : 'Emailed Product'
            }

            <p style="font-style: italic; color: grey;">
              ${
                shipped
                  ? 'Your product will be shipped soon'
                  : 'Check your verified email for your emailed product'
              }
            </p>
            `,
            /* eslint-enable */
            Charset: 'UTF-8',
          },
        },
        Subject: {
          Data: 'Order processed!',
        },
      },
    },
    Destination: {
      ToAddresses: [ownerEmail, customerEmail],
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
