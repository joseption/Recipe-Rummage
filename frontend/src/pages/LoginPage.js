import React, { useEffect, useRef, useState } from 'react';
import '../styles/LoginPage.css';
import Login from '../components/Login';
import ForgotPassword from '../components/ForgotPassword';

const LoginPage = (props) =>
{
  const [screen, setScreen] = useState('');
  const content = useRef(null);

  useEffect(() => {
    if (!screen || screen === "login") {
      content.current.style.transform = "translate(0px, 0px)";
    }
    else if (screen === "password") {
      content.current.style.transform = "translate(-395px, 0px)";
    }
  }, [screen]);

    return(
      <div className="login-background">
        <div className="login-container">
          <div className="login-content">
            <div ref={content} className="login-workflow-content">
            <Login setScreen={setScreen} />
            {/* <ForgotPassword setScreen={setScreen} /> */}
            </div>
          </div>
        </div>
      </div>
    );
};

export default LoginPage;

// import React from 'react';

// import PageTitle from '../components/PageTitle';
// import Login from '../components/Login';

// const LoginPage = () =>
// {

//     return(
//       <div>
//         <PageTitle />
//         <Login />
//       </div>
//     );
// };

// export default LoginPage;
