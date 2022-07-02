import React, { useEffect, useState } from 'react';
import { config } from '../Constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { includesSymbol, isAtLeastEightChars, includesUpperContains, textMatches, acceptableSymbols } from '../Helper';

function SetPassword(props)
{
    var loginPassword;
    var loginPasswordVerify;

    const [message, setMessage] = useState('');
    const [hasSymbol, setHasSymbol] = useState(false);
    const [hasCharLimit, setHasCharLimit] = useState(false);
    const [hasUpperCase, setHasUpperCase] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [disabled, setDisabled] = useState('');

    const checkDisabledBtn = () => {
        setDisabled(!hasSymbol || !hasCharLimit || !hasUpperCase || !isMatching);
    }

    useEffect(() => {
        checkDisabledBtn();
    });

    const getValidAttribute = (e) => {
        return e ? 'green' : 'red';
    }

    const handleChange = (e) => {
        setHasSymbol(includesSymbol(e.target.value) ? true : false);
        setHasCharLimit(isAtLeastEightChars(e.target.value));
        setHasUpperCase(includesUpperContains(e.target.value))
        setIsMatching(textMatches(e.target.value, loginPasswordVerify.value));

        checkDisabledBtn();
    }

    const handleVerifyChange = (e) => {
        setIsMatching(textMatches(e.target.value, loginPassword.value));
        checkDisabledBtn();
    }

    const backToLogin = () => {
        setMessage('');
        loginPassword.value = "";
        loginPasswordVerify.value = "";
        setDisabled(true);
        props.setError([{el:loginPassword, isError:false}, {el:loginPasswordVerify, isError:false}]);
        handleChange({target: loginPassword})
        handleVerifyChange({target: loginPasswordVerify})
        props.setScreen("login");
    };

    const doPasswordUpdate = async event => 
    {
        event.preventDefault();
        let pw = loginPassword;
        let pwv = loginPasswordVerify;
        props.setError([{el:pw, isError:false}, {el:pwv, isError:false}]);
        let obj;
        if (props.isPasswordReset)
            obj = {type:'reset', password_id:props.passwordID, password:loginPassword.value, passwordVerify:loginPasswordVerify.value};
        else
            obj = {type:'activate', password_id:props.passwordID, password:loginPassword.value, passwordVerify:loginPasswordVerify.value};

        let js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(`${config.URL}/api/update-password`,
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            let res = JSON.parse(await response.text());

            if(res.error)
            {
                props.setError([{el:pw, isError:true}, {el:pwv, isError:true}]);
                setMessage(res.error);
            }
            else
            {
                props.setError([{el:pw, isError:false}, {el:pwv, isError:false}]);
                props.setScreen("password_updated");
            }
        }
        catch(e)
        {
            setMessage('An unexpected error occurred while updating your password. Please try again.');
            return;
        }    
    };

    return(
        <div>
            <form className="login-form" onSubmit={doPasswordUpdate}>
            <div className="login-title-container">
                <FontAwesomeIcon onClick={() => backToLogin()} className="login-navigate-btn" icon={solid('arrow-left')} />
                <span className="login-title">Update Password</span>
            </div>
            <div className="login-password-update-title">Enter your new password. You must choose a password that meets the requirements.</div>
            <div className="login-input-container">
                <div className="login-input-header">Password</div>
                <input type="password" onChange={(e) => {handleChange(e)}} ref={(c) => loginPassword = c} />
            </div>
            <div className="login-input-container">
                <div className="login-input-header">Verify Password</div>
                <input type="password" onChange={(e) => {handleVerifyChange(e)}} ref={(c) => loginPasswordVerify = c} />
            </div>
            <div className="login-password-hint-container">
                <div style={{color: getValidAttribute(hasCharLimit)}} className="login-password-hint">
                { hasCharLimit ? (
                        <FontAwesomeIcon icon={solid('check')}></FontAwesomeIcon>
                        ) :
                        (<FontAwesomeIcon icon={solid('xmark')}></FontAwesomeIcon>
                        )
                    }
                    <div>Includes at least 8 characters</div>
                </div>
                <div style={{color: getValidAttribute(hasSymbol)}} className="login-password-hint">
                { hasSymbol ? (
                        <FontAwesomeIcon icon={solid('check')}></FontAwesomeIcon>
                        ) :
                        (<FontAwesomeIcon icon={solid('xmark')}></FontAwesomeIcon>
                        )
                    }
                    <div>Includes a symbol {acceptableSymbols()}</div>
                </div>
                <div style={{color: getValidAttribute(hasUpperCase)}} className="login-password-hint">
                { hasUpperCase ? (
                        <FontAwesomeIcon icon={solid('check')}></FontAwesomeIcon>
                        ) :
                        (<FontAwesomeIcon icon={solid('xmark')}></FontAwesomeIcon>
                        )
                    }
                    <div>Includes at least one uppercase letter</div>
                </div>
                <div style={{color: getValidAttribute(isMatching)}} className="login-password-hint">
                { isMatching ? (
                        <FontAwesomeIcon icon={solid('check')}></FontAwesomeIcon>
                        ) :
                        (<FontAwesomeIcon icon={solid('xmark')}></FontAwesomeIcon>
                        )
                    }
                    <div>Passwords match</div>
                </div>
            </div>
            <input type="submit" disabled={disabled} className="login-login-btn btn btn-success" value="Update Password" onClick={doPasswordUpdate} />
            <div className="login-error-msg">{message}</div>
            </form>
        </div>
    );
};

export default SetPassword;
