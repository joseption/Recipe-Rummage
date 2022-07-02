import React, { useState } from 'react';
import { config } from '../Constants'

function Login(props)
{
    var email;
    var loginPassword;

    const [message, setMessage] = useState('');

    const doLogin = async event => 
    {
        event.preventDefault();

        let obj = {email:email.value,password:loginPassword.value};
        let js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(`${config.URL}/api/login`,
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            let res = JSON.parse(await response.text());

            if( res._id <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                let user = {email:res.firstName,lastName:res.lastName,user_id:res.id}  //original
                localStorage.setItem('user_data', JSON.stringify(user));

                setMessage('');
                window.location.href = '/item';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };

    return(
        <div>
            <form className="login-form" onSubmit={doLogin}>
            <div className="login-title-container">
                <span className="login-title">Welcome</span>
            </div>
            <div className="login-input-container">
                <div className="login-input-header">Email</div>
                <input type="text" ref={(c) => email = c} />
            </div>
            <div className="login-input-container">
                <div className="login-input-header">Password</div>
                <input type="password" ref={(c) => loginPassword = c} />
                <div className="login-forgot-password link" onClick={() => props.setScreen("forgot_password")}>Forgot Password?</div>
            </div>
            <input type="submit" className="login-login-btn btn btn-success" value="Login" onClick={doLogin} />
            </form>
            <div className="login-error-msg">{message}</div>
            <hr className="splitter" />
            <div className="login-register-container">
                <div className="login-register-title">New around here?</div>
                <div className="btn btn-primary" onClick={() => props.setScreen("register")}>Register</div>
            </div>
        </div>
    );
};

export default Login;
