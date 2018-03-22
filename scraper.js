var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var firebase = require('firebase');

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
              console.log('waiting');
            }
        }
        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
      }
}

const ACCESS_TOKEN = '592427624453133|cXjZJnH2TnUVOm7aS8TpuZ1N6Ok';
const PAGE_ID = '462508190484900';
const BASE = 'https://graph.facebook.com/v2.11';

// returns url for facebook graph api that just returns the feed
// not including comments or likes
var getFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + "/feed/?access_token=" + access_token;
}

// returns url for facebook graph api that includes comments and likes
var getCompleteFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + "/feed/?fields=message,comments.limit(999).summary(true),likes.limit(999).summary(true)" + "&access_token=" + access_token;
        
}

var scrapeSinglePage = (url, aCallback) => {
  var client = new HttpClient();
  
  client.get(url, function(response) {
    var res = JSON.parse(response);
    var data = res.data;
    aCallback(data);
  });  
}

var addPostToFirebase = (post) => {
  firebase.database().ref('posts/'+post.id).set({
    ...post
  })
}

var addListOfPostsToFirebase = function(listOfPosts) {
  listOfPosts.forEach(function(element) {
    addPostToFirebase(element);
  });
}

var url = getCompleteFacebookFeedUrl(PAGE_ID, ACCESS_TOKEN);
scrapeSinglePage(url, addListOfPostsToFirebase);
setTimeout(() => {
  firebase.database().goOffline();
}, 10000);
