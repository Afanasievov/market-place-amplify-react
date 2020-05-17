import React, { useState, useContext } from 'react';
import { API, graphqlOperation, Logger } from 'aws-amplify';
import { Form, Button, Dialog, Input, Notification } from 'element-react';
import { createMarket } from '../graphql/mutations';
import { UserContext } from '../App';

const logger = new Logger('NewMarket.js', process.env === 'production' ? 'INFO' : 'DEBUG');

export default () => {
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [name, setName] = useState('');
  const user = useContext(UserContext);

  const handleAddMarket = async () => {
    try {
      setAddMarketDialog(false);
      const input = {
        name,
        owner: user.username,
      };

      await API.graphql(graphqlOperation(createMarket, { input }));
      setName('');
    } catch (error) {
      logger.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error adding market'}`,
      });
    }
  };

  return (
    <>
      <div className="market-header">
        <h1 className="market-title">Create Your MarketPlace</h1>
        <Button
          type="text"
          icon="edit"
          className="market-title-button"
          onClick={() => setAddMarketDialog(true)}
        />
      </div>

      <Dialog
        title="Create New Market"
        visible={addMarketDialog}
        onCancel={() => setAddMarketDialog(false)}
        size="large"
        customClass="dialog"
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Add Market Name">
              <Input
                placeholder="Market Name"
                trim
                onChange={(newName) => setName(newName)}
                value={name}
              />
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
          <Button type="primary" disabled={!name} onClick={handleAddMarket}>
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};
