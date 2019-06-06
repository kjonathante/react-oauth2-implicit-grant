import React from 'react';
import rsa from './react-simple-auth'
import {docusignProvider} from './docusign'

function App() {
  const handleClick = async () => {
    try{
      const session = await rsa.acquireTokenAsync(docusignProvider)
      console.log(session)
      const result = await fetch("http://localhost:8000/oauth/userinfo",{
        headers: {
          "Authorization" : `Bearer ${session.accessToken}`
        },
        mode: "cors"
      })
      console.log( await result.json())
 
    } catch( error ) {
      console.log(error)
    }
  }
  // curl --request GET https://account-d.docusign.com/oauth/userinfo 
  // --header "Authorization: Bearer eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQkAAAABAAUABwCAsMpGzrbVSAgAgPDtVBG31UgCAIh5T0YjCJpArIp4HuVWq3oVAAEAAAAYAAEAAAAFAAAADQAkAAAANWMyYjhkN2UtODNjMy00OTQwLWFmNWUtY2RhOGE1MGRkNzNmMACAsMpGzrbVSBIAAQAAAAsAAABpbnRlcmFjdGl2ZQ.dQlkwNWp3Da4szwytnCd20qlzxeuoLIkGbCJ8tPiL-pb9LngAUr7kCCl8jrsyUyB_3M7Y7dcgHYYrEmMFI5Sg6BPiS9LSLbq9KD-GkzBKbZbHZZGSMjT7zAspJF7ph6H6kSUrsot-kDMw3e82hx_LeJq7Qhm8cFxUm5Tt4TQVqqG8-sEwBElflKLQIgigqHZV5tUtjQFS6sne6fFltX2-XcKYxOgiU_OiJTBijqvhDuSeacHZILqvM3Na01ywP2XA-Vn5tnJfBT5Ww7tpUteMFId9R3oBikUslpggt1ePbJxZyn6EWlimIlxssqw00hHpAJB2WsghGq9LyiFrUqvdw"

  return (
    <div>
      <button onClick={handleClick}>Log In</button>
    </div>
  );
}

export default App;
