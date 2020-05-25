import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';
import { Card, Button, Dialog, Form, Input, Radio, Notification, Popover } from 'element-react';
import { convertCentsToDollars, convertDollarsToCents } from '../utils';
import { UserContext } from '../App';
import PayButton from './PayButton';
import { updateProduct, deleteProduct } from '../graphql/mutations';

const Product = ({ product }) => {
  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(true);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);

  const handleUpdateProduct = async (id) => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id,
        description,
        shipped,
        price: convertDollarsToCents(price),
      };
      const duration = 2000;

      await API.graphql(graphqlOperation(updateProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully updated!',
        type: 'success',
        duration,
      });
      setTimeout(() => {
        window.location.reload();
      }, duration);
    } catch (error) {
      console.error('handleUpdateProduct -> error', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      setDeleteProductDialog(false);
      const input = { id };
      const duration = 2000;

      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully deleted!',
        type: 'success',
        duration,
      });
      setTimeout(() => {
        window.location.reload();
      }, duration);
    } catch (error) {
      console.error('handleUpdateProduct -> error', error);
    }
  };

  return (
    <UserContext.Consumer>
      {({ user }) => {
        const isProductOwner = user && user.attributes.sub === product.owner;

        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
              <S3Image
                imgKey={product.file.key}
                theme={{ photoImg: { maxWidth: '100%', maxHeight: '100%' } }}
              />
              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <div className="items-center">
                  <img
                    src={`https:icon.now.sh/${product.shipped ? 'markunread_mailbox' : 'mail'}`}
                    alt="Shipping Icon"
                    className="icon"
                  />
                  {product.shipped ? 'Shipped' : 'Emailed'}
                </div>
                <div className="text-right">
                  $<span className="mx-1">{convertCentsToDollars(product.price)}</span>
                  {!isProductOwner && <PayButton />}
                </div>
              </div>
            </Card>
            <div className="text-center">
              {isProductOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    onClick={() => {
                      setUpdateProductDialog(true);
                      setDescription(product.description);
                      setShipped(product.shipped);
                      setPrice(convertCentsToDollars(product.price));
                    }}
                  />
                  <Popover
                    placement="top"
                    width="160"
                    visible={deleteProductDialog}
                    content={(
                      <>
                        <p>Do you want to delete this?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteProductDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="mini"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    )}
                  >
                    <Button
                      type="danger"
                      icon="delete"
                      onClick={() => {
                        setDeleteProductDialog(true);
                      }}
                    />
                  </Popover>
                </>
              )}
            </div>
            <Dialog
              title="Update Product"
              size="large"
              customClass="dialog"
              visible={updateProductDialog}
              onCancel={() => setUpdateProductDialog(false)}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      placeholder="Product Description"
                      icon="information"
                      trim
                      value={description}
                      onChange={(text) => setDescription(text)}
                    />
                  </Form.Item>
                  <Form.Item label="Product Price">
                    <Input
                      type="number"
                      icon="plus"
                      placeholder="Price ($USD)"
                      value={price}
                      onChange={(num) => setPrice(num)}
                    />
                  </Form.Item>
                  <Form.Item label="Update Shipping">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={shipped === true}
                        onChange={() => setShipped(true)}
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value="false"
                        checked={shipped === false}
                        onChange={() => setShipped(false)}
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setUpdateProductDialog(false)}>Cancel</Button>
                <Button type="primary" onClick={() => handleUpdateProduct(product.id)}>
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
