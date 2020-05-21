/* eslint-disable */

import React, { useState } from 'react';
import { API, graphqlOperation, Logger } from 'aws-amplify';
import { searchMarkets } from '../graphql/queries';
import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';

const logger = new Logger('[HomePage.js]', 'INFO');

export default () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (term) => setSearchTerm(term);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearch = async (event) => {
    try {
      event.preventDefault();
      setIsSearching(true);
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { owner: { match: searchTerm } },
              { tags: { match: searchTerm } },
            ],
          },
          // sort: {
          //   field: 'createdAt',
          //   sort: 'desc',
          // },
        }),
      );
      setSearchResults(result.data.searchMarkets.items);
      setIsSearching(false);
    } catch (error) {
      logger.error(error);
    }
  };

  return (
    <>
      <NewMarket
        isSearching={isSearching}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
      />
      <MarketList searchResults={searchResults} />
    </>
  );
};
