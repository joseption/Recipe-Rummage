import React, { useEffect, useRef, useState } from 'react';
import '../styles/LoginPage.css';
import Login from '../components/Login';
import ForgotPassword from '../components/ForgotPassword';
import PasswordSent from '../components/PasswordSent';
import { useSearchParams } from 'react-router-dom';
import SetPassword from '../components/SetPassword';
import PasswordUpdated from '../components/PasswordUpdated';

const LoginPage = (props) =>
{
  const [email, setEmail] = useState('');
  const [screen, setScreen] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const content = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [passwordID, setPasswordID] = useState('');
  const [isPasswordReset, setIsPasswordReset] = useState('');

  useEffect(() => {
    if (!loaded)
    {
      var resetID = searchParams.get("reset_id");
      if (resetID) {
        setPasswordID(resetID);
        setIsPasswordReset(true);
        setScreen("set_password");
      }

      var activateID = searchParams.get("activate_id");
      if (activateID) {
        setPasswordID(activateID);
        setIsPasswordReset(false);
        setScreen("set_password");
      }

      setLoaded(true);
    }

    let base = 430;
    if (!screen || screen === "login") {
      content.current.style.transform = `translate(0px, 0px)`;
    }
    else if (screen === "forgot_password") {
      content.current.style.transform = `translate(-${base}px, 0px)`;
    }
    else if (screen === "password_sent") {
      content.current.style.transform = `translate(-${base * 2}px, 0px)`;
    }
    else if (screen === "set_password") {
      content.current.style.transform = `translate(-${base * 3}px, 0px)`;
    }
    else if (screen === "password_updated") {
      content.current.style.transform = `translate(-${base * 4}px, 0px)`;
      setSearchParams({});
    }   

    if (error) {
      for (let i = 0; i < error.length; i++) {
        if (error[i].el) {
          if (error[i].isError) {
            error[i].el.classList.add("input-error");
            error[i].el.previousSibling.classList.add("input-title-error");
          }
          else {
            error[i].el.classList.remove("input-error");
            error[i].el.previousSibling.classList.remove("input-title-error");
          }
        }
      }
    }
  }, [error, screen, searchParams, loaded, setSearchParams]);

    return(
      <div className="login-background">
        <div className="login-container">
          <div className="login-content">
            <div ref={content} className="login-workflow-content">
            <Login setError={setError} setScreen={setScreen} />
            <ForgotPassword setEmail={setEmail} setError={setError} setScreen={setScreen} />
            <PasswordSent email={email} setScreen={setScreen} />
            <SetPassword setError={setError} isPasswordReset={isPasswordReset} passwordID={passwordID} setScreen={setScreen} />
            <PasswordUpdated setScreen={setScreen} />
            </div>
          </div>
        </div>
      </div>
    );
};

export default LoginPage;
