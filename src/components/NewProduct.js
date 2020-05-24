/* eslint-disable */
import React, { useState } from 'react';
import { PhotoPicker } from 'aws-amplify-react';
import { Form, Button, Input, Notification, Radio, Progress } from 'element-react';

const NewProduct = () => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [image, setImage] = useState('');

  const handleAddProduct = () => {
    console.log('NewProduct -> description', description);
    console.log('NewProduct -> price', price);
    console.log('NewProduct -> shipped', shipped);
    console.log('NewProduct -> image', image);
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
          {imagePreview && <img className="image-preview" src={imagePreview} alt="Image Preview" />}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={(url) => setImagePreview(url)}
            onPick={(file) => setImage(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: '0.8em',
              },
              formSection: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
              sectionBody: {
                margin: 0,
                width: '250px',
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)',
              },
              photoPickerButton: {
                // display: 'none',
              },
            }}
          />
          <Form.Item>
            <Button
              disable={!image || !description || !price}
              type="primary"
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
