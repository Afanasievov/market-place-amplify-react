import React, { useState, useEffect } from 'react';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Auth, Hub, Logger } from 'aws-amplify';
import '@aws-amplify/ui/dist/style.css';

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

  return user ? <div>App</div> : <Authenticator theme={theme} />;
}

export default App;
