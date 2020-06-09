import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API, graphqlOperation, Logger } from 'aws-amplify';
import { Loading, Icon, Tabs } from 'element-react';
import { onUpdateProductCustom, onDeleteProductCustom, onCreateProductCustom } from '../graphql/subscriptions';
// import { getMarket } from '../graphql/queries';
import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

export const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 999) {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
  }
`;

const logger = new Logger('[MarketPage.js]', 'INFO');

export const MarketPage = ({ id, user, userAttributes }) => {
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      const input = { id };
      const result = await API.graphql(graphqlOperation(getMarket, input));
      setMarket(result.data.getMarket);
      setIsLoading(false);
    };

    fetchMarket();
  }, [id]);

  useEffect(() => {
    if (user && market) {
      setIsMarketOwner(user.username === market.owner);
    }
  }, [user, market]);

  useEffect(() => {
    if (userAttributes) {
      setEmailVerified(userAttributes.email_verified);
    }
  }, [userAttributes]);

  useEffect(() => {
    const createSub = API.graphql(graphqlOperation(onCreateProductCustom)).subscribe({
      next: (data) => {
        const created = data.value.data.onCreateProductCustom;
        setMarket((prev) => {
          const updatedProducts = [created, ...market.products.items];
          const updatedMarket = { ...prev };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
      error: (error) => logger.error('sub ERROR:', error),
      close: () => logger.log('Done'),
    });

    return () => {
      createSub.unsubscribe();
    };
  });

  useEffect(() => {
    const updateSub = API.graphql(
      graphqlOperation(onUpdateProductCustom, { owner: user.username }),
    ).subscribe({
      next: (data) => {
        const updated = data.value.data.onUpdateProductCustom;
        setMarket((prev) => {
          const updatedProducts = prev
            .products.items.map((p) => (p.id === updated.id ? updated : p));
          const updatedMarket = { ...prev };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
      error: (error) => logger.error(error),
      close: () => logger.log('Done'),
    });

    return () => {
      updateSub.unsubscribe();
    };
  });

  useEffect(() => {
    const deleteSub = API.graphql(graphqlOperation(onDeleteProductCustom)).subscribe({
      next: (data) => {
        const deleted = data.value.data.onDeleteProductCustom;
        setMarket((prev) => {
          const updatedProducts = prev.products.items.filter((p) => p.id !== deleted.id);
          const updatedMarket = { ...prev };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
      error: (error) => logger.error(error),
      close: () => logger.log('Done'),
    });

    return () => {
      deleteSub.unsubscribe();
    };
  });

  return isLoading ? (
    <Loading fullscreen />
  ) : (
    <>
      <Link className="link" to="/">
        Back to Markets List
      </Link>
      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2>- {market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: 'var(--lightSquidInk)', paddingBottom: '1em' }}>
          <Icon name="date" />
          {market.createdAt}
        </span>
      </div>

      <Tabs type="border-card" value={isMarketOwner ? '1' : '2'}>
        {isMarketOwner && (
          <Tabs.Pane
            label={(
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            )}
            name="1"
          >
            {emailVerified ? (
              <NewProduct marketId={id} />
            ) : (
              <Link to="/profile" className="header">
                Verify your email before adding Products
              </Link>
            )}
          </Tabs.Pane>
        )}
        <Tabs.Pane
          label={(
            <>
              <Icon name="menu" className="icon" />
              Products ({market.products.items.length})
            </>
          )}
          name="2"
        >
          <div className="product-list">
            {market.products.items.map((product) => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};
