import React from 'react';
import rsa from './react-simple-auth'
import {docusignProvider} from './docusign'

function App() {
  const handleClick = async () => {
    try{
      const session = await rsa.acquireTokenAsync(docusignProvider)
      console.log(session)
    } catch( error ) {
      console.log(error)
    }
  }

  return (
    <div>
      <button onClick={handleClick}>Log In</button>
    </div>
  );
}

export default App;
