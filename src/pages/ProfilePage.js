import React, { useState, useEffect } from 'react';
import { Auth, API, graphqlOperation, Logger } from 'aws-amplify';
import { // eslint-disable-line object-curly-newline
  Tabs,
  Icon,
  Card,
  Table,
  Tag,
  Button,
  Dialog,
  Form,
  Input,
  Message,
  Notification,
  MessageBox,
} from 'element-react'; // eslint-disable-line object-curly-newline
import { convertCentsToDollars, formatOrderDate } from '../utils';

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
  const [emailDialog, setEmailDialog] = useState(false);
  const [email, setEmail] = useState(userAttributes && userAttributes.email);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationForm, setVerificationForm] = useState(false);

  const handleDeleteProfile = () => {
    MessageBox.confirm(
      'This will permanently delete your account. Continue?',
      'Attention',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      },
    ).then(async () => {
      try {
        await user.deleteUser();
        window.location.reload();
      } catch (error) {
        logger.error(error);
      }
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Delete cancelled',
      });
    });
  };

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
            <Tag type="danger">Unverified</Tag>
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
              <Button type="info" size="small" onClick={() => setEmailDialog(true)}>
                Edit
              </Button>
            );
          case 'Delete Profile':
            return (
              <Button type="danger" size="small" onClick={handleDeleteProfile}>
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

  const sendVerificationCode = async (attr) => {
    await Auth.verifyCurrentUserAttribute(attr);
    setVerificationForm(true);
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${email}`,
    });
  };

  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = { email };
      const result = await Auth.updateUserAttributes(user, updatedAttributes);
      if (result === 'SUCCESS') {
        sendVerificationCode('email');
      }
    } catch (error) {
      logger.error(error);
      Notification.error({
        title: 'error',
        message: `${error.message} || 'Error updating email`,
      });
    }
  };

  const handleVerifyEmail = async (attr) => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(attr, verificationCode);
      Notification({
        title: 'Success',
        message: 'Email successfully verified',
        type: `${result.toLowerCase()}`,
      });
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      logger.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error updating email'}`,
      });
    }
  };

  return (
    userAttributes && (
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
                    <p>Purchased on {formatOrderDate(createdAt)}</p>
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
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email"
          visible={emailDialog}
          onCancel={() => setEmailDialog(false)}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input value={email} onChange={(newEmail) => setEmail(newEmail)} />
              </Form.Item>
              {verificationForm && (
                <Form.Item label="Enter Verification Code" labelWidth="120">
                  <Input
                    onChange={(verifiedCode) => setVerificationCode(verifiedCode)}
                    value={verificationCode}
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
            {!verificationForm && (
              <Button type="primary" onClick={handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationForm && (
              <Button type="primary" onClick={() => handleVerifyEmail('email')}>
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  );
};
