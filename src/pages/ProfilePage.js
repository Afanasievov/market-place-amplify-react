import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Logger } from 'aws-amplify';
import { Tabs, Icon, Card, Table, Tag, Button } from 'element-react';
import { convertCentsToDollars } from '../utils';

const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC, limit: 999) {
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

const logger = new Logger('[ProfilePage.js]', 'INFO');

export default ({ user, userAttributes }) => {
  const [orders, setOrders] = useState([]);
  const [columns] = useState([
    { prop: 'name', width: '150' },
    { prop: 'value', width: '330' },
    {
      prop: 'tag',
      width: '150',
      render: (row) => {
        if (row.name === 'Email') {
          const emailVerified = userAttributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">Verified</Tag>
          );
        }
        return undefined;
      },
    },
    {
      prop: 'operations',
      render: (row) => {
        switch (row.name) {
          case 'Email':
            return (
              <Button type="info" size="small">
                Edit
              </Button>
            );
          case 'Delete Profile':
            return (
              <Button type="danger" size="small">
                Delete
              </Button>
            );
          default:
            return undefined;
        }
      },
    },
  ]);

  useEffect(() => {
    if (userAttributes) {
      try {
        const getOrders = async () => {
          const input = { id: userAttributes.sub };
          const result = await API.graphql(graphqlOperation(getUser, input));

          setOrders(result.data.getUser.orders.items);
        };

        getOrders();
      } catch (error) {
        logger.error(error);
      }
    }
  }, [userAttributes]);

  return userAttributes && (
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
          <Table
            columns={columns}
            data={[
              {
                name: 'Your Id',
                value: userAttributes.sub,
              },
              {
                name: 'Username',
                value: user.username,
              },
              {
                name: 'Email',
                value: userAttributes.email,
              },
              {
                name: 'Phone Number',
                value: userAttributes.phone_number,
              },
              {
                name: 'Delete Profile',
                value: 'Sorry to see you go',
              },
            ]}
            showHeader={false}
            rowClassName={(row) => row.name === 'Delete Profile' && 'delete-profile'}
          />
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
                          {shippingAddress.country} {shippingAddress.address_zip}
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
