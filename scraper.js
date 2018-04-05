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
              console.log(anHttpRequest.status);
            }
        }
        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
      }
}

//change page id to scrape a different page
const ACCESS_TOKEN = '592427624453133|cXjZJnH2TnUVOm7aS8TpuZ1N6Ok';
const PAGE_ID = '462508190484900';

const BASE = 'https://graph.facebook.com/v2.12';

// returns url for facebook graph api that just returns the feed
// not including comments or likes
var getFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + "/feed/?access_token=" + access_token;
}

// returns url for facebook graph api that includes comments and likes
var getCompleteFacebookFeedUrl = (page_id, access_token) => {
  return BASE + "/" + page_id + "/feed/?fields=message,created_time,comments.limit(999).summary(true){message,from,likes.limit(999).summary(true)},likes.limit(999).summary(true)" + "&access_token=" + access_token;        
}

//scrapes single page and applies callback function on the response
var scrapeSinglePage = (url, aCallback) => {
  var client = new HttpClient();
  
  client.get(url, function(response) {
    var res = JSON.parse(response);
    aCallback(res);
  });  
}

var addPostToFirebase = (post) => {
  firebase.database().ref('posts/'+post.id).set({
    ...post
  })
}

var addListOfPostsToFirebase = (listOfPosts) => {
  listOfPosts = listOfPosts.data;
  listOfPosts.forEach(function(element) {
    addPostToFirebase(element);
  });
}

//scrapes multple pages, and applies aCallback to each response object
var scrapeMultiplePages = (url, num, aCallback) => {
  if (num === 0) {
    return;
  }
  scrapeSinglePage(url, (res) => {
    aCallback(res);
    scrapeMultiplePages(res.paging.next, num-1, aCallback);
  })
}


//example usage//

var client = new HttpClient();
var url = getFacebookFeedUrl(PAGE_ID, ACCESS_TOKEN);
client.get(url, (res) => {
  console.log(res);
})

// var url = getCompleteFacebookFeedUrl(PAGE_ID, ACCESS_TOKEN);
// scrapeMultiplePages(url, 3, (res) => {
//   console.log(res);
// })





