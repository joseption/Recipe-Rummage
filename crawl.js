var request = require('request');
var fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const {ObjectId} = require('mongodb');

require('dotenv').config({path: './.env'});
const uri = process.env.MONGODB_URI;


//adds document to database
function addRecipe(recipe_list) {
  const client = new MongoClient(uri);

  async function run() {
    try {
      const db = client.db("LargeProject");
      const collection = db.collection('Recipe');
  
      // prevents additional documents from being inserted if one fails
      const options = { ordered: true };
  
      const result = await collection.insertMany(recipe_list, options);
  
      console.log(`${result.insertedCount} documents were inserted`);
  
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
}



// crawler for yummly.com
// creates object array of 
function crawl() {
  var website = "https://www.yummly.com";

  let start = 0;
  if (process.argv[2])
  {
    start = process.argv[2] * 500 + 1;
  }
  const end = start + 1000;

  var yummly_api = "https://mapi.yummly.com/mapi/v16/content/search?solr.seo_boost=new&start="+start+"&maxResult=" + end +
              "&fetchUserCollections=false&allowedContent=single_recipe&allowedContent=suggested_search" + 
              "&allowedContent=related_search&allowedContent=article&allowedContent=video&guided-search=true" + 
              "&solr.view_type=search_internal";

  request(yummly_api, function(error, response, body) {
    if(error) {
      console.log("Error: " + error);
    }

    // console.log('Getting recipes from: ' + start + " - " + end);

    var res = JSON.parse(response.body);
    var recipe_list = [];
    var recipe_obj;

    res.feed.forEach(function(prefix) {

      const recipe_name = prefix.display.displayName;
      const ingredientList = prefix.content.ingredientLines;
      const cook_time = prefix.content.details.totalTime;
      const serving_size = prefix.content.details.numberOfServings;
      const recipe_tags = prefix.seo.spotlightSearch.keywords;


      const image_url = prefix.display.images;
      const recipe_url = website + prefix['tracking-id'];
      let ingredients = [];
      let recipe_category = [];

      
      const courseList = prefix.content.tags.course;

      ingredientList.forEach(function(element) {
        ingredients.push(element.ingredient);
      });

      if(courseList) {
        courseList.forEach(function(element) {
          recipe_category.push(element['display-name']);
        });
      }

      // document format
      recipe_obj =
      {
        recipe_category : recipe_category, 
        recipe_name : recipe_name,
        ingredients : ingredients, 
        cook_time : cook_time,
        serving_size : serving_size,
        recipe_tags : recipe_tags,
        recipe_url : recipe_url,
        image_url : image_url
      };
      recipe_list.push(recipe_obj);

      
      // fs.appendFileSync('output.txt', '{\n' + 
      //   'recipe_category: ' + recipe_category + ',\n' +
      //   'recipe_name: ' + recipe_name + ',\n' + 
      //   'ingredients: ' + ingredients + ',\n' + 
      //   'cook_time: ' + cook_time + ',\n' + 
      //   'serving_size: ' + serving_size + ',\n' + 
      //   'recipe_tags: ' + recipe_tags + ',\n' +
      //   'recipe_url: ' + website + '/' + recipe_url + ',\n' + 
      //   'image_url: ' + image_url + '\n' + 
      //   '}' + '\n');
    }); // end loop

    addRecipe(recipe_list);

    // -------output to console-------
    // for(var i=0; i < 10; i++){
    //   console.log(recipe_list[i]);
    // }
    // fs.appendFileSync('output.txt', ']');
  });

}

// checkFileExists();
crawl();
