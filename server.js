const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const validateEmail = (email) => {
  return String(email)
  .toLowerCase()
  .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

const validatePassword = (password, passwordVerify) => {
  let symbol = /[!@#$%&?]/.test(password);
  let upperCase = /[A-Z]/.test(password);
  let length = password.length >= 8;
  let match = password === passwordVerify && password && passwordVerify;
  return symbol && upperCase && length && match;
};

const { 
  v4: uuid
} = require('uuid');

const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');

require('dotenv').config({path: './.env'});
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect();


const path = require('path');           
const PORT = process.env.PORT || 5000;  
const app = express();
app.set('port', (process.env.PORT || 5000));

app.use(cors());
app.use(bodyParser.json());

function siteURL() {
  return (process.env.NODE_ENV === "development") ? process.env.DEV_URL : process.env.PROD_URL;
}

function generateAccessToken(email) {
  return jwt.sign({ email }, process.env.TOKEN_SECRET, { expiresIn: "14400s", }); // four hour token
}

function validateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.status(401).json({error: 'Unauthorized'});
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).json({error: 'Forbidden'});
      return;
    }

    req.tokenData = decoded;
    next();
  });
}

//--------------------login/password API's--------------------//
app.post('/api/login', async (req, res, next) => 
{
  // incoming: email, password
  // outgoing: id, error

  const { email, password } = req.body;

  const db = client.db("LargeProject");
  const results = await db.collection('User').find({email:email}).toArray();

  if (results.length > 0)
  {
    bcrypt.compare(password, results[0].password).then(isMatch => {
      if (isMatch) {
        let id = results[0]._id;
        let user_id = results[0].user_id;

        const token = generateAccessToken({email});
        res.status(200).json({ token: `Bearer ${token}`, id:id, user_id: user_id, email:email, error:''});
      } else {
        res.status(400).json({ error: 'The email or password did not match' });
      }
    });
  }
  else {
    res.status(400).json({ error:'The username or password did not match' });
  }
});

app.post('/api/register', async (req, res, next) =>
{
  // incoming: email
  // outgoing: sent email
	
  let error = "";
  const { email } = req.body;
  const activate_id = uuid();
  const newItem = {email:email, active:false, activate_id:activate_id};

  try
  {
    let existing;
    const db = client.db("LargeProject");
    const accounts = await db.collection('User').find({email:email}).toArray();
    
    if (accounts && accounts.length > 0)
    {
      if (!accounts[0].active) {
        existing = accounts[0]._id;
        error = "Account Exists";
      }
      else {
        res.status(400).json({error:'An account with this email address is already in use'});
        return;
      }
    }

    if (!existing)
      db.collection('User').insertOne(newItem);
    else {
      const filter = { "email": email};
      let update = { $set: { activate_id: activate_id } };  
      db.collection('User').updateOne(filter, update);
    }

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
    const msg = {
      to: req.body.email,
      from: 'support@joseption.com',
      subject: 'Account Activation',
      html: 'Hey there, thank you for your interest in finding some awesome recipes! Let\'s finish getting your account setup.<br /><br />Please click the following link to activate your account: ' + siteURL() + "/login?activate_id=" + activate_id,
    };
  
    let hasError = false;
    sgMail.send(msg).catch(err => {
      hasError = true;
      res.status(400).json({error:'Unable to send reset email'});
      return;
    });  
  }
  catch(e)
  {
    res.status(400).json({error: 'Error: ' + e});
  }

  res.status(200).json({error:error});
});

app.post('/api/update-password', async (req, res, next) => 
{
  // incoming: reset id, password

  const { type, password_id, password, passwordVerify } = req.body;

  if (!validatePassword(password, passwordVerify)) {
    res.status(400).json({error:'Password does not meet the minimum requirements'});
    return;
  }

  const db = client.db("LargeProject");
  let find;
  if (type == 'reset')
  find = {reset_id: password_id};  
  else if (type == 'activate')
  find = {activate_id: password_id}; 
  else {
    res.status(400).json({error: 'Invalid update type, password could not be changed'});
    return;
  }
  const results = await db.collection('User').find(find).toArray();

  let user_id = -1;
  let id;
  let active = false;

  if (results.length > 0)
  {
    id = results[0]._id;
    user_id = results[0].user_id;
    active = results[0].active;
  }

  if (id) {
    if (active !== true && type == 'reset') {
      res.status(400).json({error:'Unable to reset password, check your email for the account activation link first'});
      return;
    }

    // Password hashing
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          res.status(400).json({ err: 'An issue occurred while setting the password' });
          return
        }

        const filter = { "_id": ObjectId(id)};
        let update;
        if (type == 'reset')
          update = { $set: { reset_id: '', password: hash } };  
        else if (type == 'activate')
          update = { $set: { activate_id: '', password: hash, active: true } };  
        else {
          res.status(400).json({error: 'Invalid update type, password could not be changed'});
          return;
        }
    
        try
        {
          const db = client.db("LargeProject");
          db.collection('User').updateOne(filter, update);
          res.status(200).json({error:''});
        }
        catch(e)
        {
          res.status(400).json({error: 'ERROR: ' + e});
        }
      });
    });
  }
  else {
    res.status(400).json({error:'You are using an invalid reset link'});
  }
});

app.post('/api/send-password-reset', async (req, res, next) => 
{
  // incoming: email
  // outgoing: send email

  const { email } = req.body;

  if (!validateEmail(email)) {
    res.status(400).json({error:'Invalid Email'});
    return;
  }

  const db = client.db("LargeProject");
  const results = await db.collection('User').find({email}).toArray();

  let reset_id = "";
  let user_id = -1;
  let id;
  let active = false;

  if (results.length > 0)
  {
    // generate reset ID
    reset_id = uuid();
    id = results[0]._id;
    user_id = results[0].user_id;
    active = results[0].active;
  }

  if (id) {
    if (active !== true) {
      res.status(400).json({error:'Unable to reset password, check your email for the account activation link first'});
      return;
    }

    const filter = { "_id": ObjectId(id)};
    const update = { $set: { reset_id: reset_id } };  
    try
    {
      const db = client.db("LargeProject");
      db.collection('User').updateOne(filter, update);

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
      const msg = {
        to: req.body.email,
        from: 'support@joseption.com',
        subject: 'Reset Account Password',
        html: 'We noticed you\'re having some trouble logging in, sorry about that! Let\'s see if we can get you logged back in.<br /><br />Please click the following link to reset your account password: ' + siteURL() + "/login?reset_id=" + reset_id,
      };
    
      let hasError = false;
      sgMail.send(msg).catch(err => {
        hasError = true;
        res.status(400).json({error:'Unable to send reset email'});
        return;
      });        

      if (!hasError) {
        res.status(200).json({error:''});
      }
    }
    catch(e)
    {
      res.status(400).json({error: 'ERROR: ' + e});
    }
  }
  else {
    res.status(400).json({error:'An account with that email does not exist'});
  }
});


//--------------------grocery API's--------------------//
app.post('/api/add-grocery-item', async (req, res, next) =>
{
  // incoming: user_id, item
  // outgoing: error
	
  const { user_id, item } = req.body;

  const newItem = {item:item,user_id:user_id};
  let error = '';

  try
  {
    const db = client.db("LargeProject");
    const result = db.collection('Item').insertOne(newItem);
  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/update-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, item, updatedItem
  // outgoing: error

  const { user_id,item, updatedItem } = req.body;


  let error = '';

  try
  {
    const db = client.db("LargeProject");
    const result = db.collection("Item");
    const filter = { item:item, user_id:user_id };
    const updateDoc = {
      $set: {
        item: updatedItem
      },
    };
    const out = result.updateOne(filter, updateDoc);


  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/remove-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, item
  // outgoing: itemToDelete, error

  const { user_id,item } = req.body;
  const itemToDelete = { item:item,user_id:user_id };
  let error = '';

  try
  {
    const db = client.db("LargeProject");
    const result = db.collection('Item').deleteOne(itemToDelete);
  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { itemToDelete:item,error: error };
  res.status(200).json(ret);
});

app.post('/api/search-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, search
  // outgoing: results[], error

  let error = '';

  const { user_id, search } = req.body;

  let _search = search.trim();
  
  const db = client.db("LargeProject");
  const results = await db.collection('Item').find({"item":{$regex:_search+'.*', $options:'r'}}).toArray();
  
  let _ret = [];
  for( var i=0; i<results.length; i++ )
  {
    _ret.push( results[i].item );
  }
  
  let ret = {results:_ret, error:error};
  res.status(200).json(ret);
});


//--------------------recipe API's--------------------//
app.post('/api/add-recipe', async (req, res, next) =>   
{
  // creates document in Recipe collection with fields: 
      //          _id:   autop-generated by mongoDB
      //      user_id:   the _id from User collection
      //  recipe_name:   incoming
      //  description:   incoming
      //          url:   incoming
      //    image_url:   incoming
      //  is_favorite:   default = false
   // incoming: email, recipe_name, description, url, image_url
  // outgoing: error

  const { email, recipe_name, description, url, image_url  } = req.body;
  let error = '';

  try
  {
    const db = client.db("LargeProject");
    const current_user = await db.collection('User').find({email:email}).toArray();
    const newItem = { user_id:current_user[0]._id, recipe_name:recipe_name, description:description, url:url, image_url:image_url, is_favorite: false };

    const result = db.collection('Recipe').insertOne(newItem);
  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { error: error };
  res.status(200).json(ret);
});


app.post('/api/update-recipe', async (req, res, next) =>  
{
  // updates document fields: recipe_name, description, url, and image_url

  // incoming: user_id, recipe_name, new_recipe_name, new_description, new_url, new_image_url
  // filter: user_id, recipe_name
  // outgoing: results[], error

  var { user_id, recipe_name, new_recipe_name, new_description, new_url, new_image_url } = req.body;
  let error = '';
  const updateRecipe = { user_id:user_id, recipe_name:new_recipe_name, description:new_description, url:new_url, image_url:new_image_url };



  try
  {
    const db = client.db("LargeProject");

    const recipe = await db.collection('Recipe').find({user_id:ObjectId(user_id), recipe_name:recipe_name}).toArray();
    console.log('Found Document =>', recipe);

    if( new_recipe_name == null )
    {
      new_recipe_name = recipe[0].recipe_name;
    }
    if( new_description == null )
    {
      new_description = recipe[0].description;
    }
    if( new_url == null )
    { 
      new_url = recipe[0].url;
    }
    if( new_image_url == null )
    {
      new_image_url = recipe[0].image_url;
    }

    const filter = { user_id:ObjectId(user_id), recipe_name:recipe_name };
    const updateDoc = { $set: { recipe_name:new_recipe_name, description:new_description, url:new_url, image_url:new_image_url }, };
    const result = await db.collection('Recipe').updateOne(filter, updateDoc);
  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { updateRecipe: updateRecipe, error: error };
  res.status(200).json(ret);
});
  


app.post('/api/remove-recipe', async (req, res, next) => 
{
  // deletes document in Recipe Collection
  // 
  // incoming: user_id, recipe_name
  // outgoing: recipeToDelete, error

  const { user_id, recipe_name } = req.body;
  const recipeToDelete = { user_id:ObjectId(user_id), recipe_name:recipe_name };
  let error = '';

  try
  {
    const db = client.db("LargeProject");

    const recipe = await db.collection('Recipe').find({user_id:ObjectId(user_id), recipe_name:recipe_name}).toArray();
    console.log('Deleted Document =>', recipe);

    const result = db.collection('Recipe').deleteOne(recipeToDelete);
  }
  catch(e)
  {
    error = e.toString();
  }

  let ret = { recipeToDelete:recipe_name,error: error };
  res.status(200).json(ret);
});

app.post('/api/search-recipe', async (req, res, next) => 
{
  // incoming: user_id, search
  // outgoing: results[], error
});

app.post('/api/get-favorite', async (req, res, next) => 
{
  // incoming: user_id, search
  // outgoing: results[], error

  let error = '';

  const { user_id } = req.body;
  
  // returns: 401 = unauthorized // or 403 = forbidden
  await validateToken(req, res, async () => {
    const db = client.db("LargeProject");
    const results = await db.collection('Favorite').find({"user_id": ObjectId(user_id)}).toArray();
    let _ret = [];
    for (var i = 0; i < results.length; i++) {
      _ret.push(results[i]);
    }
    
    let ret = {results:_ret, error:error};
    res.status(200).json(ret);
  });
});

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});


app.listen(PORT, () => 
{
  console.log('Server listening on port ' + PORT);
});


///////////////////////////////////////////////////
// For Heroku deployment

// Server static assets if in production
if (process.env.NODE_ENV === 'production') 
{
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => 
 {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}