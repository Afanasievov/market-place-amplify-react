import React from 'react';

const Error = ({ errors }) => (
  <pre className="error">
    {errors.map(({ message }, i) => (
      <div key={i}>{message}</div> // eslint-disable-line react/no-array-index-key
    ))}
  </pre>
);

export default Error;
