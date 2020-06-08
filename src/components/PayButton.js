import React from 'react';
import { API, Logger, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { Notification, Message } from 'element-react';
import { getUser } from '../graphql/queries';
import { createOrder } from '../graphql/mutations';
import { history } from '../App';

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

  /* eslint-disable camelcase */
  const createShippingAddress = ({
    address_city,
    address_country,
    address_line1,
    address_state,
    address_zip,
  }) => ({
    city: address_city,
    country: address_country,
    address_line1,
    address_state: address_state || address_city,
    address_zip,
  });
  /* eslint-enable camelcase */

  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner); // eslint-disable-line no-unused-vars
      // TODO: uncomment after SES sending unverified emails is available
      // const result = await API.post('marketRESTAPI', '/mp/charge', {
      //   body: {
      //     token,
      //     charge: {
      //       currency: stripeConfig.currency,
      //       amount: product.price,
      //       description: product.description,
      //     },
      //     email: {
      //       customerEmail: user.attributes.email,
      //       ownerEmail,
      //       shipped: product.shipped,
      //     },
      //   },
      // });
      const result = true;

      // TODO: use result from API.post to fill the order data
      if (result) {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(token.card);
        }
        const input = {
          orderUserId: user.attributes.sub,
          orderProductId: product.id,
          shippingAddress,
        };
        await API.graphql(graphqlOperation(createOrder, { input }));
        const duration = 3000;
        Notification({
          title: 'Success',
          message: 'Order has been processed successfully',
          type: 'success',
          duration,
        });
        setTimeout(() => {
          history.push('/');
          Message({
            type: 'info',
            message: 'Check your verified email for order details',
            duration: 5000,
            showClose: true,
          });
        }, duration);
      }
    } catch (error) {
      logger.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message} || 'Order processing error'`,
      });
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
