var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var firebase = require('firebase');

const APP_SECRET = 'c483463796702394e21785b63321f7a0';
const APP_ID = '592427624453133';
const ACCESS_TOKEN = '592427624453133|cXjZJnH2TnUVOm7aS8TpuZ1N6Ok';
const MIT_PAGE_ID = '462508190484900';
const BASE = 'https://graph.facebook.com/v2.11';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDYaBSb8t7kQkRat7k-PXlHYTkYENArh3s",
  authDomain: "mitconfessions-f127f.firebaseapp.com",
  databaseURL: "https://mitconfessions-f127f.firebaseio.com",
  projectId: "mitconfessions-f127f",
  storageBucket: "",
  messagingSenderId: "65581099978"
};
firebase.initializeApp(config);

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
                console.log('success');
                aCallback(anHttpRequest.responseText);
            }else{
              console.log('failed');
            }
        }
        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
      }
}

const post_id = '462508190484900_1728617183873988';

const base = BASE;
const feed_node = "/" + MIT_PAGE_ID + "/feed";
const parameters = "/?access_token=" + ACCESS_TOKEN;
const feed_url = base + feed_node + parameters


var scrapeSinglePage = function(url, aCallback) {
  var client = new HttpClient();
  
  client.get(url, function(response) {
    var res = JSON.parse(response);
    var data = res.data;
    aCallback(data);
  });  
}

var addPostToFirebase = function(postId, timeCreated, text) {
  firebase.database().ref('posts/'+postId).set({
    time_created: timeCreated,
    text: text,
    postId: postId
  })
}

var addListOfPostsToFirebase = function(listOfPosts) {
  listOfPosts.forEach(function(element) {
    addPostToFirebase(element.id, element.created_time, element.message);
  });
}

var client = new HttpClient();
client.get(BASE+"/"+post_id+"/likes"+parameters, function(response) {
  var res = JSON.parse(response);
  console.log('logging response');
  console.log(res);
});