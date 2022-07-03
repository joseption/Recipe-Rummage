import React, { useEffect, useState } from 'react';
import { config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

function RegisterSent(props)
{    
    const [disabled,setDisabled] = useState('');
    const [time,setTime] = useState(0);
    const [counter,setCounter] = useState('');
    const [message,setMessage] = useState('');
    const [sentMsg,setSentMsg] = useState('');

    useEffect(() => {
        if (props.resendVerify)
            setSentMsg("An unverified email address is already associated with this account. Another activation link has been sent to the address. You must activate your account before you can continue.");
        else
            setSentMsg("An email with a link to activate your account has been sent to you.");

        let interval;
        if (disabled) {
            interval = setInterval(() => {
                if (Date.now() - time >= 60000) {
                    setDisabled(false);
                    setCounter("");
                    clearInterval(interval);
                    setTime(0);
                }
                else {
                    setCounter("Try again in " + Math.abs(Math.round(60 - ((Date.now() - time) / 1000))) + " seconds");
                    setDisabled(true);
                }
            }, 1000);
        }
        else {
            if (interval)
                clearInterval(interval);
            setCounter("");
            setTime(0);
            setDisabled(false);
        }
    }, [disabled, time, props.resendVerify]);

    const showScreen = () => {
        props.setScreen("register");
    }

    const disableBtn = (disable) => {
        if (disable)
            setTime(Date.now());
        else 
            setTime(0);

        setDisabled(disable);
    }

    const doResendEmail = async event => 
    {
        event.preventDefault();
        disableBtn(true);
        setMessage("");
        if (!props.email) {
            setMessage("You must use a valid email address");
            disableBtn(false);
            return;
        }

        let obj = {email:props.email};
        let js = JSON.stringify(obj);

        try
        {    
            await fetch(`${config.URL}/api/register`,
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}}).then(async ret => {
                    let res = JSON.parse(await ret.text());
                    if(res.error && res.error !== "Account Exists")
                    {
                        if (res.error === "Invalid Email") {
                            setMessage("You must use a valid email address");
                        }
                        else
                            setMessage(res.error);

                        disableBtn(false);
                    }
                });
        }
        catch(e)
        {
            disableBtn(false);
            setMessage("An error occurred while attempting to send a password reset email!");
            return;
        }    
    };

    return(
        <div>
            <form className="login-form" onSubmit={doResendEmail}>
                <div className="login-title-container">
                    <FontAwesomeIcon onClick={() => showScreen("register")} className="login-navigate-btn" icon={solid('arrow-left')} />
                    <span className="login-title">Activation Email Sent</span>
                </div>
                <div className="login-reset-sent-title">{sentMsg}</div>
                <div className="login-forgot-msg"><b>Please check your inbox</b></div>
                <hr className="splitter" />
                <div className="login-reset-resend-title">Still haven't received an email yet?</div>
                <input type="submit" disabled={disabled} className="btn btn-success" value={!disabled ? 'Resend Email' : 'Email Sent'} onClick={doResendEmail} />
            </form>
            <div className="login-timer">{counter}</div>
            <div className="login-error-msg">{message}</div>
        </div>
    );
};

export default RegisterSent;
