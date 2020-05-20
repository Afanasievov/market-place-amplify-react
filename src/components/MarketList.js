import React from 'react';
import { Link } from 'react-router-dom';
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import { Loading, Card, Tag } from 'element-react';
import { listMarkets } from '../graphql/queries';
import Error from './Error';

const MarketList = () => (
  <Connect query={graphqlOperation(listMarkets)}>
    {({ data, loading, errors }) => {
      if (errors.length > 0) {
        return <Error errors={errors} />;
      }
      if (loading || !data.listMarkets) {
        return <Loading fullscreen />;
      }

      return (
        <>
          <h2 className="header">
            <img
              src="https://icon.now.sh/store_mall_directory/527FFF"
              alt="Store Icon"
              className="large-icon"
            />
            Markets
          </h2>
          {data.listMarkets.items.map((market) => (
            <div key={market.id} className="my-2">
              <Card
                bodyStyle={{
                  padding: '0.7em',
                  display: 'flex',
                  alignments: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span className="flex">
                    <Link className="link" to={`/markets/${market.id}`}>
                      {market.name}
                    </Link>
                    <span style={{ color: 'var(--darkAmazonOrange' }}>
                      {market.products.items && market.products.items.length}
                    </span>
                    <img src="https://icon.now.sh/shopping_cart/f60" alt="Shopping Cart" />
                    <div style={{ color: 'var(--lightSquidInk' }}>{market.owner}</div>
                  </span>
                </div>
                <div>
                  {market.tags
                    && market.tags.map((tag) => (
                      <Tag key={tag} type="danger" className="mx-1">
                        {tag}
                      </Tag>
                    ))}
                </div>
              </Card>
            </div>
          ))}
        </>
      );
    }}
  </Connect>
);

export default MarketList;
