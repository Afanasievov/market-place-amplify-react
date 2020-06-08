import React, { useState, useEffect } from 'react';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Auth, API, Hub, Logger, graphqlOperation } from 'aws-amplify';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'element-theme-default';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';

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

export const UserContext = React.createContext();

const App = () => {
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

  const registerNewUser = async (signInData) => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub,
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        await API.graphql(graphqlOperation(registerUser, { input: registerUserInput }));
      } catch (error) {
        logger.error(error);
      }
    }
  };

  useEffect(() => {
    const onHubCapsule = (capsule) => {
      switch (capsule.payload.event) {
        case 'signIn':
          logger.debug('onHubCapsule -> signIn');
          getUserData();
          registerNewUser(capsule.payload.data);
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

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      logger.error(error);
    }
  };

  return user ? (
    <UserContext.Provider value={{ user }}>
      <Router>
        <>
          <Navbar user={user} handleSignOut={handleSignOut} />
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route
              exact
              path="/markets/:id"
              component={({ match }) => <MarketPage user={user} id={match.params.id} />}
            />
          </div>
        </>
      </Router>
    </UserContext.Provider>
  ) : (
    <Authenticator theme={theme} />
  );
};

export default App;
