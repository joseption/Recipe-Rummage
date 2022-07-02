function PasswordUpdated(props)
{    
    return(
        <div className="login-form">
            <div className="login-title-container">
                <span className="login-title">Password Updated</span>
            </div>
            <div className="login-password-updated-title">Your password has been updated. Please return to the login page to access your account.</div>
            <div className="btn btn-primary" onClick={() => props.setScreen("login")}>Back to Login</div>
        </div>
    );
};

export default PasswordUpdated;
