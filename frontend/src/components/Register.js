import React, { useEffect, useState } from 'react';
import { config } from '../Constants'
import { validateEmail } from '../Helper';

function Register(props)
{
    var email;

    const [disabled, setDisabled] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setDisabled(true);
    }, [setDisabled]);

    const backToLogin = () => {
        setMessage("");
        email.value = "";
        props.setError([{el:email, isError:false}]);
        setDisabled(true);
        props.setScreen("login");
    }

    const checkDisabledBtn = (type) => {
        let emailError = !(validateEmail(email.value));
        if (type === 'email')
            props.setError([{el:email, isError:!emailError ? false : true}]);

        setDisabled(emailError);
        return emailError;
    };

    const handleChange = (type) => {
        checkDisabledBtn(type);
    };

    const doRegister = async event => 
    {
        setMessage("");
        event.preventDefault();
        props.setEmail(email.value);
        if (checkDisabledBtn())
            return;

        let obj = {email:email.value};
        let js = JSON.stringify(obj);
        let emailInput = email;

        try
        {    
            await fetch(`${config.URL}/api/register`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}}).then(async ret => {
                let res = JSON.parse(await ret.text());
                if (res.error && res.error !== "Account Exists")
                {
                    setMessage(res.error);
                }
                else
                {
                    if (res.error === "Account Exists") {
                        props.setResendVerify(true);
                    }

                    emailInput.value = "";
                    props.setError([{el:email, isError:false}]);
                    setDisabled(true);
                    props.setScreen("register_sent");
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
            <form className="login-form" onSubmit={doRegister}>
            <div className="login-title-container">
                <span className="login-title">Register</span>
            </div>
            <div className="login-register-msg">An activation email will be sent to the address you enter below</div>
            <div className="login-input-container login-register-email">
                <div className="login-input-header">Email</div>
                <input type="text" onChange={(e) => {handleChange('email')}} ref={(c) => email = c} />
            </div>
            <input type="submit" disabled={disabled} className="login-login-btn btn btn-success" value="Create Account" onClick={doRegister} />
            </form>
            <div className="login-error-msg">{message}</div>
            <hr className="splitter" />
            <div className="login-register-container">
                <div className="login-register-title">Already have an account?</div>
                <div className="btn btn-primary" onClick={() => backToLogin()}>Back to Login</div>
            </div>
        </div>
    );
};

export default Register;
