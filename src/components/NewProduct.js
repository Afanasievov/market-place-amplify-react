/* eslint-disable */
import React, { useState } from 'react';
import { PhotoPicker } from 'aws-amplify-react';
import { Form, Button, Input, Notification, Radio, Progress } from 'element-react';

const NewProduct = () => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);

  const handleAddProduct = () => {
    console.log('product');
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="Description"
              onChange={(text) => setDescription(text)}
            />
          </Form.Item>
          <Form.Item label="Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="Price ($USD)"
              onChange={(num) => setPrice(num)}
            />
          </Form.Item>
          <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
            <div className="text-center">
              <Radio value="true" checked={shipped === true} onChange={() => setShipped(true)}>
                Shipped
              </Radio>
              <Radio value="false" checked={shipped === false} onChange={() => setShipped(false)}>
                Emailed
              </Radio>
            </div>
          </Form.Item>
          <PhotoPicker />
          <Form.Item>
            <Button type="primary" onClick={handleAddProduct}>Add Product</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
