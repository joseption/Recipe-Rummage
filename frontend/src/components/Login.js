import React, { useCallback, useEffect, useState } from 'react';
import { config } from '../Constants'
import { validateEmail } from '../Helper';

function Login(props)
{
    var email;
    var loginPassword;

    const checkDisabledBtn = useCallback((type) => {
        let emailError = !(validateEmail(email.value));
        let passwordError = loginPassword.value.length === 0;
        if (type === 'email')
            props.setError([{el:email, isError:!emailError ? false : true}]);
        else if (type === 'password')
            props.setError([{el:loginPassword, isError:passwordError}]);

        setDisabled(emailError || passwordError);
        return emailError || passwordError;
    });

    const [disabled, setDisabled] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        var info = JSON.parse(localStorage.getItem('user_data'));
        if (info && !!info.id) {
            window.location.href = '/profile';
        }

        checkDisabledBtn(email);
        checkDisabledBtn(loginPassword);
    }, [email, loginPassword, checkDisabledBtn]);

    const handleChange = (type) => {
        checkDisabledBtn(type);
    };

    const showScreen = (screen) => {
        setMessage("");
        email.value = "";
        loginPassword.value = "";
        setDisabled(true);
        props.setError([{el:email, isError:false}, {el:loginPassword, isError:false}]);
        props.setScreen(screen);
    };

    const doLogin = async event => 
    {
        event.preventDefault();
        if (checkDisabledBtn())
            return;

        let obj = {email:email.value,password:loginPassword.value};
        let js = JSON.stringify(obj);

        try
        {   
            await fetch(`${config.URL}/api/login`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error)
                {
                    setMessage(res.error);
                }
                else
                {
                    let user = {id:res.id, user_id:res.user_id, email:res.email, auth: res.token};
                    localStorage.setItem('user_data', JSON.stringify(user));

                    setMessage('');
                    window.location.href = "/profile";
                }
            });
        }
        catch(e)
        {
            setMessage('An unknown error occurred');
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
                <input type="text" onChange={(e) => {handleChange('email')}} ref={(c) => email = c} />
            </div>
            <div className="login-input-container">
                <div className="login-input-header">Password</div>
                <input type="password" onChange={(e) => {handleChange('password')}} ref={(c) => loginPassword = c} />
                <div className="login-forgot-password link" onClick={() =>showScreen("forgot_password")}>Forgot Password?</div>
            </div>
            <input type="submit" disabled={disabled} className="login-login-btn btn btn-success" value="Login" onClick={doLogin} />
            </form>
            <div className="login-error-msg">{message}</div>
            <hr className="splitter" />
            <div className="login-register-container">
                <div className="login-register-title">New around here?</div>
                <div className="btn btn-primary" onClick={() => showScreen("register")}>Register</div>
            </div>
        </div>
    );
};

export default Login;
