import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Tabs, Icon, Card } from 'element-react';
import { convertCentsToDollars } from '../utils';

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders {
        items {
          id
          createdAt
          product {
            id
            description
            price
            owner
            createdAt
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
    }
  }
`;

export default ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const getOrders = async () => {
      const input = { id: user.attributes.sub };
      const result = await API.graphql(graphqlOperation(getUser, input));

      setOrders(result.data.getUser.orders.items);
    };

    getOrders();
  }, [user]);

  return (
    <>
      <Tabs activeName="1" className="profile-tabs">
        <Tabs.Pane
          name="1"
          label={(
            <>
              <Icon name="document" className="icon" />
              Summary
            </>
          )}
        >
          <h2 className="header">Profile Summary</h2>
        </Tabs.Pane>
        <Tabs.Pane
          name="2"
          label={(
            <>
              <Icon name="message" className="icon" />
              Orders
            </>
          )}
        >
          <h2 className="header">Order History</h2>
          {orders.map(({ id, product: { price, description, shippingAddress }, createdAt }) => (
            <div className="mb-1" key={id}>
              <Card>
                <pre>
                  <p>Order Id: {id}</p>
                  <p>Order Description: {description}</p>
                  <p>Order Price: {convertCentsToDollars(price)}</p>
                  <p>Purchased on {createdAt}</p>
                  {shippingAddress && (
                    <>
                      Shipping Address
                      <div className="ml-2">
                        <p>{shippingAddress.address_line1}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.address_state}
                          {shippingAddress.country} {' '}
                          {shippingAddress.address_zip}
                        </p>
                      </div>
                    </>
                  )}
                </pre>
              </Card>
            </div>
          ))}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};
