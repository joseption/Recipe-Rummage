import React, { useState } from 'react';
import { config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { validateEmail } from '../Helper';

function ForgotPassword(props)
{
    var emailForm;

    const [message,setMessage] = useState('');
    const [disabled,setDisabled] = useState(true);

    const backToLogin = () => {
        setMessage('');
        emailForm.value = "";
        setDisabled(true);
        props.setError([{el:emailForm, isError:false}]);
        props.setScreen("login");
    };

    const handleChange = (e) => {
        var error = !validateEmail(e.target.value) ? true : false;
        props.setError([{el:emailForm, isError:error}]);
        setDisabled(error);
    };

    const doSendEmail = async event => 
    {
        let emailInput = emailForm;
        event.preventDefault();
        props.setEmail(emailForm.value);
        setDisabled(true);
        setMessage("");
        props.setError([{el:emailForm, isError:false}]);
        let obj = {email:emailForm.value};
        let js = JSON.stringify(obj);

        try
        {    
            await fetch(`${config.URL}/api/send-password-reset`,
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}}).then(async ret => {
                    let res = JSON.parse(await ret.text());
                    if(res.error)
                    {
                        if (res.error === "Invalid Email") {
                            setMessage("You must enter a valid email address");
                        }
                        else
                            setMessage(res.error);

                        props.setError([{el:emailInput, isError:true}]);
                    }
                    else
                    {
                        emailInput.value = "";
                        setDisabled(true);
                        props.setError([{el:emailInput, isError:false}]);
                        props.setScreen("password_sent")
                    }

                    setDisabled(false);
                });
        }
        catch(e)
        {
            setDisabled(false);
            setMessage("An unexpected error occurred while sending the password reset email. Please try again.");
            return;
        }    
    };



    return(
        <div>
            <form className="login-form" onSubmit={doSendEmail}>
            <div className="login-title-container">
                <FontAwesomeIcon onClick={() => backToLogin()} className="login-navigate-btn" icon={solid('arrow-left')} />
                <span className="login-title">Forgot Password</span>
            </div>
            <div className="login-forgot-msg">Enter your email address and we will attempt to send you a password reset link.</div>
            <div className="login-input-container">
                <div className="login-input-header">Email</div>
                <input type="text" onChange={(e) => {handleChange(e)}} ref={(c) => emailForm = c} />
            </div>
            <input type="submit" disabled={disabled} className="login-login-btn btn btn-success" value="Send Email" onClick={doSendEmail} />
            </form>
            <div className="login-error-msg">{message}</div>
        </div>
    );
};

export default ForgotPassword;
