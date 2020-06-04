import React from 'react';
import { API, Logger } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
// import { Notification, Message } from "element-react";

const { REACT_APP_STRIPE_PUBLISHABLE } = process.env;

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: REACT_APP_STRIPE_PUBLISHABLE,
};

const logger = new Logger('[PayButton.js]', 'INFO');

const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try {
      await API.post('marketRESTAPI', '/mp/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
        },
      });
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
