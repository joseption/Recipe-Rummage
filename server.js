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

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

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
const { match } = require('assert');
const { pipeline } = require('stream');
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
	
  await validateToken(req, res, async () => {
    const { user_id, item } = req.body;
    let error = '';

    try
    {
      const db = client.db("LargeProject");
      let items;
      const result = await db.collection('Item').insertOne({item:item, user_id:ObjectId(user_id)});
      if (result)
        items = await db.collection('Item').find({_id:ObjectId(result.insertedId)}).toArray();
      
      if (items.length > 0) {
        res.status(200).json({error: '', result:items[0]});
      }
      else {
        res.status(400).json({error: 'Item could not be retrieved'});
      }

      return;
    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    res.status(200).json(ret);
  });
});

app.post('/api/update-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, item, updatedItem
  // outgoing: error

  await validateToken(req, res, async () => {
    const { id, item } = req.body;

    let error = '';

    try
    {
      const db = client.db("LargeProject");
      const filter = { _id: ObjectId(id) };
      const update = { $set: { item:item } };
      await db.collection("Item").updateOne(filter, update);
    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    res.status(200).json(ret);
  });
});

app.post('/api/remove-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, item
  // outgoing: itemToDelete, error

  await validateToken(req, res, async () => {
    const { id } = req.body;
    let error = '';

    try
    {
      const db = client.db("LargeProject");
      await db.collection('Item').deleteOne({ _id:ObjectId(id) });
    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    res.status(200).json(ret);
  });
});

app.post('/api/search-grocery-item', async (req, res, next) => 
{
  // incoming: user_id, search
  // outgoing: results[], error

  await validateToken(req, res, async () => {
    let error = '';

    const { user_id } = req.body;
    const fetchItems = { user_id:user_id };

    
    const db = client.db("LargeProject");
    const results = await db.collection('Item').find(fetchItems).toArray();
    let _ret = [];
    for( var i=0; i<results.length; i++ )
    {
      _ret.push( results[i].item );
    }
    
    let ret = { results:_ret, error:error };
    res.status(200).json(ret);
  });
});

app.post('/api/get-grocery-items', async (req, res, next) => 
{
  // incoming: user_id
  // outgoing: results[], error

  await validateToken(req, res, async () => {
    let error = '';

    const { user_id} = req.body;
    
    const db = client.db("LargeProject");
    const results = await db.collection('Item').find({user_id:ObjectId(user_id)}).sort({item:1}).toArray();
    
    let ret = {results:results, error:error};
    res.status(200).json(ret);
  });
});


//--------------------Search Page API--------------------//
// Add Recipe: to be used if the user wishes to manually enter a recipe
app.post('/api/add-favorite', async (req, res, next) =>
{
  // incoming: user_id, recipe_category, recipe_name, ingredients, cook_time, serving_size, recipe_tags, recipe_url, image_url
  // outgoing: error

  await validateToken(req, res, async () => {
    const { item_id, user_id, recipe_category, recipe_name, ingredients, cook_time, serving_size, recipe_tags, recipe_url, image_url } = req.body;
    const newItem = { item_id:ObjectId(item_id), user_id:ObjectId(user_id), recipe_category:recipe_category, recipe_name:recipe_name, ingredients:ingredients, cook_time:cook_time, serving_size:serving_size, recipe_tags:recipe_tags, recipe_url:recipe_url, image_url:image_url };

    let error = '';

    try
    {
      const db = client.db("LargeProject");
      const results = await db.collection('Favorite').insertOne(newItem);
      if (results) {
        res.status(200).json({error: '', id: results.insertedId});
        return;
      }

    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    res.status(200).json(ret);
  });
});



// fetches a random 50 recipes from Recipe collection
app.post('/api/get-recipes', async (req, res, next) =>
{
  // incoming: 
  // outgoing: 50 randomly selected recipes

  await validateToken(req, res, async () => {
    let error = '';
    let random_recipes = [];


    const db = client.db("LargeProject")

    const pipeline = 
    [
      // random sample of 50 documents
      { '$sample': { 'size': 50 } },
      // hides _id
      { '$project': { '_id': 0 } }
    ];

    db.collection('Recipe').aggregate(pipeline).toArray(function(err, results){
      if(err) throw err;
      for(var i = 0; i < results.length; i++ )
      {
        random_recipes.push(results[i]);
      }
    let ret = { results: random_recipes, error: error };
    res.status(200).json(ret);
    });
  });
});

// searches for recipes based on user's pantry selection (Search Page)
app.post('/api/recipe-search', async (req, res, next) => 
{
  // incoming: selected_grocery_items
  // outgoing: matching_recipes

  await validateToken(req, res, async () => {
    const { selected_grocery_items, search_all } = req.body;
    let error = '';
    let matching_recipes = [];   
    const db = client.db("LargeProject")

    let pipeline;
    if (search_all) {
      pipeline = 
      {
        $or:
        [ 
          {"ingredients": { $all: selected_grocery_items }},
          {"recipe_tags": { $all: selected_grocery_items }}
        ]
      };
    }
    else {
      pipeline = 
      {
        $or:
        [ 
          {"ingredients": { $in: selected_grocery_items }},
          {"recipe_tags": { $in: selected_grocery_items }}
        ]
      };
    }
    db.collection('Recipe').find(pipeline).toArray(function(err, results){
      if (err)
        throw err;
        
      for(i = 0; i < results.length; i++ )
      {
        matching_recipes.push(results[i]);
      }

      let ret = { results: matching_recipes, error: error };
      res.status(200).json(ret);
    });
  });
});

// Search Page
// app.post('/api/search-recipes', async (req, res, next) => 
// {
//   res.status(400).json({error:'Not ready!'})
  // // incoming: items
  // // outgoing: results[], error

  // try
  // { 
  //   const { items } = req.body;
  //   // ============== WARNING ==============
  //   // === DO NOT ALTER OR REMOVE BELOW! ===
  //   // =============== START ===============
  //   const result_limit = 10; // DO NOT ADJUST
  //   // THIS IS NOT THE CORRECT LINK, WE NEED TO FIND A BETTER SOLUTION
  //   const url = `https://${process.env.RAPID_API_HOST}/recipes/complexSearch?query=pasta&cuisine=italian&instructionsRequired=true&fillIngredients=false&addRecipeInformation=false&ignorePantry=false&number=${result_limit}&limitLicense=false&ranking=2`;
  //   const db = client.db("LargeProject");
  //   const date = new Date(new Date().toDateString());
  //   const results = await db.collection('Requests').find({ "date" : date }).toArray();
  //   if (results.length == 0) {
  //     db.collection('Requests').insertOne({date:date, count:0});
  //     results = await db.collection('Requests').find({ "date" : date }).toArray();
  //   }

  //   if (results.length > 0) {
  //     // Put the count at 40 just to be safe (DO NOT ADJUST COUNT)
  //     if (results[0].count >= 40) { // DO NOT ADJUST
  //       res.status(400).json({error:'Max searches reached'})
  //       return;
  //     }

  //     const filter = { "_id": results[0]._id };
  //     let update = { $set: { count: results[0].count + 3 } }; // DO NOT EDIT -> 1 call = 3
  //     db.collection('Requests').updateOne(filter, update);
  //   }
  //   else {
  //     res.status(400).json({error:'Unable to search'})
  //     return;
  //   }

  //   // KILL SWITCH
  //   //res.status(400).json({error:'Service not enabled'})
  //   //return;
  //   // KILL SWITCH

  //   // ============== WARNING ==============
  //   // === DO NOT ALTER OR REMOVE ABOVE! ===
  //   // ================ END ================

  //   if (!items) {
  //     res.status(400).json({error: 'Please add items before searching'});
  //     return;
  //   }
  
  //   const options = {
  //       method: 'GET',
  //       headers: {
  //           'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  //           'X-RapidAPI-Host': process.env.RAPID_API_HOST
  //       }
  //   };
  
  //   await fetch(url, options)
  //       .then(response => response.json())
  //       .then(response => {
  //         res.status(200).json({error:'', result:response})
  //       })
  //       .catch(err => {
  //         res.status(400).json({error: 'There was an error retrieving search results'});
  //       });
  // }
  // catch(e)
  // {
  //   error = e.toString();
  // }
// });

//--------------------Profile Page API--------------------//
// Update Recipe (Profile Page)
app.post('/api/update-favorite', async (req, res, next) => 
{
  // incoming: id
  // outgoing: error

  await validateToken(req, res, async () => {
    const { id, ingredients, recipe_name } = req.body;
    const db = client.db("LargeProject");  
    const filter = { "_id": ObjectId(id) };
    let error = '';
    try
    {
      const update = { $set: { recipe_name:recipe_name, ingredients:ingredients } };
      await db.collection('Favorite').updateOne(filter, update);
    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    if (error) {
      res.status(400).json(ret);
      return;
    }
    res.status(200).json(ret);
  });
});
  

// Remove Recipe (Profile/Search Page)
app.post('/api/remove-favorite', async (req, res, next) => 
{
  // incoming: id
  // outgoing: error

  await validateToken(req, res, async () => {
    const { id, user_id, item_id } = req.body;
    const db = client.db("LargeProject");  
    let error = '';
    try
    {
      if (id)
        db.collection('Favorite').deleteOne({ _id: ObjectId(id) });
      else
        db.collection('Favorite').deleteOne({ user_id: ObjectId(user_id), item_id: ObjectId(item_id) });
    }
    catch(e)
    {
      error = e.toString();
    }

    let ret = { error: error };
    if (error) {
      res.status(400).json(ret);
      return;
    }
    res.status(200).json(ret);
  });
});

// Get Recipes (Profile Page)
app.post('/api/get-favorites', async (req, res, next) => 
{
  // incoming: user_id, search
  // outgoing: results[], error

  let error = '';

  const { user_id } = req.body;
  
  //pushes back 401 or 403
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