import React, { useState } from 'react';

function Login()
{
    var email;
    var loginPassword;

    const [message,setMessage] = useState('');

    const doLogin = async event => 
    {
        event.preventDefault();

        let obj = {email:email.value,password:loginPassword.value};
        let js = JSON.stringify(obj);

        try
        {    
            const response = await fetch('http://localhost:5000/api/login',
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
      <div id="loginDiv">
        <form onSubmit={doLogin}>
        <span id="inner-title">Please Log in</span><br />
        <input type="text" id="email" placeholder="example@example.com" 
            ref={(c) => email = c} /> <br />
        <input type="password" id="loginPassword" placeholder="Password" 
            ref={(c) => loginPassword = c} /> <br />
        <input type="submit" id="loginButton" class="buttons" value = "Login"
          onClick={doLogin} />
        </form>
        <span id="loginResult">{message}</span>
     </div>
    );
};

export default Login;
