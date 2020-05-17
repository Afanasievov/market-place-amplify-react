import React, { useState, useEffect } from 'react';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Auth, Hub, Logger } from 'aws-amplify';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'element-theme-default';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

import '@aws-amplify/ui/dist/style.css';
import './App.css';

const logger = new Logger('App.js', process.env === 'production' ? 'INFO' : 'DEBUG');

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: '#006666',
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--darkAmazonOrange)',
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '5px',
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)',
  },
};

function App() {
  const [user, setUser] = useState(null);

  const getUserData = async () => {
    try {
      const authenticated = await Auth.currentAuthenticatedUser();
      setUser(authenticated);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const onHubCapsule = (capsule) => {
      switch (capsule.payload.event) {
        case 'signIn':
          logger.debug('onHubCapsule -> signIn');
          getUserData();
          break;
        case 'signUp':
          logger.debug('onHubCapsule -> signUp');
          break;
        case 'signOut':
          logger.debug('onHubCapsule -> signOut');
          setUser(null);
          break;
        default:
      }
    };

    Hub.listen('auth', (data) => {
      onHubCapsule(data);
    });

    return Hub.remove('auth');
  }, []);

  return user ? (
    <Router>
      <>
        <Navbar user={user} />
        <div className="app-container">
          <Route exact path="/" component={HomePage} />
          <Route path="/profile" component={ProfilePage} />
          <Route
            exact
            path="/markets/:id"
            component={({ match }) => <MarketPage id={match.params.id} />}
          />
        </div>
      </>
    </Router>
  ) : (
    <Authenticator theme={theme} />
  );
}

export default App;
