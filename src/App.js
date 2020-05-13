import React from 'react';
import { withAuthenticator, AmplifyTheme } from 'aws-amplify-react';
import '@aws-amplify/ui/dist/style.css';

function App() {
  return <div>App</div>;
}

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

export default withAuthenticator(App, true, [], null, theme);
