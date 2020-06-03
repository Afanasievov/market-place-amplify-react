import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
// import { Notification, Message } from "element-react";

const { REACT_APP_STRIPE_PUBLISHABLE } = process.env;

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: REACT_APP_STRIPE_PUBLISHABLE,
};

const PayButton = ({ product, user }) => (
  <StripeCheckout
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

export default PayButton;
