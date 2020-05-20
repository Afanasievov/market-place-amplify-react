import React, { useState, useContext } from 'react';
import { API, graphqlOperation, Logger } from 'aws-amplify';
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react';
import { createMarket } from '../graphql/mutations';
import { UserContext } from '../App';

const logger = new Logger('NewMarket.js', process.env === 'production' ? 'INFO' : 'DEBUG');

const NewMarket = () => {
  const tags = ['Arts', 'Web Dev', 'Crafts', 'Entertainment', 'Technology'];
  const initialOptions = tags.map((tag) => ({ value: tag, label: tag }));

  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [options, setOptions] = useState(initialOptions);
  const user = useContext(UserContext);

  const handleAddMarket = async () => {
    try {
      setAddMarketDialog(false);
      const input = {
        name,
        tags: selectedTags,
        owner: user.username,
      };

      await API.graphql(graphqlOperation(createMarket, { input }));
      setName('');
      setSelectedTags([]);
    } catch (error) {
      logger.error(error);
      Notification.error({
        title: 'Error',
        message: `${error.message || 'Error adding market'}`,
      });
    }
  };

  const handleFilterTags = (query) => {
    const selected = initialOptions.filter((tag) =>
      tag.label.toLowerCase().includes(query.toLowerCase()),
    );
    setOptions(selected);
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
            <Form.Item label="Add Tags">
              <Select
                multiple
                filterable
                remote
                placeholder="Market Tags"
                value={selectedTags}
                onChange={(chosenTags) => setSelectedTags(chosenTags)}
                remoteMethod={handleFilterTags}
              >
                {options.map(({ value, label }) => (
                  <Select.Option key={value} label={label} value={value} />
                ))}
              </Select>
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

export default NewMarket;
