import React from 'react';
import { API, Logger, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { getUser } from '../graphql/queries';
// import { Notification, Message } from "element-react";

const { REACT_APP_STRIPE_PUBLISHABLE } = process.env;

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: REACT_APP_STRIPE_PUBLISHABLE,
};

const logger = new Logger('[PayButton.js]', 'INFO');

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async (ownerId) => {
    let result;
    try {
      const input = { id: ownerId };
      result = await API.graphql(graphqlOperation(getUser, input));
    } catch (error) {
      logger.error(error);
    }
    return result.data.getUser.email;
  };
  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      await API.post('marketRESTAPI', '/mp/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped,
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
