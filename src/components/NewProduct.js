/* eslint-disable */
import React, { useState } from 'react';
import { Auth, Storage, API, graphqlOperation, Logger } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import { Form, Button, Input, Notification, Radio, Progress } from 'element-react';
import { createProduct } from '../graphql/mutations';
import { convertDollarsToCents } from '../utils';
import awsExports from '../aws-exports';

const logger = new Logger('[NewProducts.js]', 'INFO');

const NewProduct = ({ marketId }) => {
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shipped, setShipped] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState();
  const [percentUploaded, setPercentUploaded] = useState(0)

  const handleAddProduct = async () => {
    setIsLoading(true);
    try {
      const visibility = 'public';
      const { identityId } = await Auth.currentCredentials();
      const filename = `${identityId}/${Date.now()}-${image.name}`;
      const uploadedFile = await Storage.put(filename, image.file, {
        level: visibility,
        contentType: image.type,
        progressCallback: progress => {
          const percent = Math.round((progress.loaded/progress.total) * 100);
          setPercentUploaded(percent)
        }
      });
      const file = {
        key: uploadedFile.key,
        bucket: awsExports.aws_user_files_s3_bucket,
        region: awsExports.aws_user_files_s3_bucket_region,
      };
      const input = {
        productMarketId: marketId,
        description,
        shipped,
        price: convertDollarsToCents(price),
        file,
      };
      await API.graphql(graphqlOperation(createProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully created!',
        type: 'success',
      });
    } catch (error) {
      logger.error(error);
    } finally {
      setIsLoading(false);
    }
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
          {percentUploaded > 0 && (
            <Progress type="circle" className="progress" status="success" percentage={percentUploaded}/>
          )}
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
              disable={!image || !description || !price || isLoading}
              type="primary"
              onClick={handleAddProduct}
              loading={isLoading}
            >
              {isLoading ? 'Loading' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
