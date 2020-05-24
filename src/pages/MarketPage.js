import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { Loading, Icon, Tabs } from 'element-react';
import { getMarket } from '../graphql/queries';
import NewProduct from '../components/NewProduct';
// import Product from '../components/Product';

const MarketPage = ({ id, user }) => {
  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

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
            <NewProduct />
          </Tabs.Pane>
        )}
        <Tabs.Pane
          label={(
            <>
              <Icon name="menu" className="icon'" />
              Products ({market.products.items.length})
            </>
          )}
          name="2"
        >
          {/* <div className="product-list">
              {market.products.items.map((product) => (
                <Product product={product} />
              ))}
              </div> */}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
