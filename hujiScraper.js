var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyBkPzxch8JGq6gQYgFCKFPSNtsNFDk8GyM",
  authDomain: "hujiconfessions-de0d3.firebaseapp.com",
  databaseURL: "https://hujiconfessions-de0d3.firebaseio.com",
  projectId: "hujiconfessions-de0d3",
  storageBucket: "",
  messagingSenderId: "938333630721"
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
const PAGE_ID = '323288791493138';
const BASE = 'https://graph.facebook.com/v2.11';

const GET_ALL = "/feed/?fields=message,created_time,comments.limit(999).summary(true){message,from,likes.limit(999).summary(true)},likes.limit(999).summary(true)&access_token=";

// returns url for facebook graph api that just returns the feed
// not including comments or likes
var getFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + "/feed/?access_token=" + access_token;
}

// returns url for facebook graph api that includes comments and likes
var getCompleteFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + GET_ALL + access_token;        
}

var scrapeSinglePage = (url, aCallback) => {
  var client = new HttpClient();
  
  client.get(url, function(response) {
    var res = JSON.parse(response);
    var data = res.data;
    aCallback(res);
  });  
}


var addPostToFirebase = (post) => {
  firebase.database().ref('posts/'+post.id).set({
    ...post.created_time,
    ...post.message,
    ...post.likes,
    ...post.id
  })
  firebase.database().ref('comments/'+post.id).set({
    ...post.comments
  })
}


var addListOfPostsToFirebase = (listOfPosts) => {
  listOfPosts = listOfPosts.data;
  listOfPosts.forEach(function(element) {
    addPostToFirebase(element);
  });
}

var scrapeMultiplePages = (url, num, aCallback) => {
  if (num === 0) {
    return;
  }
  scrapeSinglePage(url, (res) => {
    aCallback(res);
    scrapeMultiplePages(res.paging.next, num-1, aCallback);
  })
}

var url = getCompleteFacebookFeedUrl(PAGE_ID, ACCESS_TOKEN);
scrapeMultiplePages(url, 2, addListOfPostsToFirebase);
setTimeout(() => {
  firebase.database().goOffline();
}, 90000);


