window.fbAsyncInit = function() {
  FB.init({
    appId      : '311391665715533',
    xfbml      : true,
    version    : 'v2.1'
  });
  MeteorFB.ready();
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

var readyCallback;

MeteorFB = {

  ready: function () {
    if (readyCallback) {
      readyCallback();
    }
  },

  onReady: function (callback) {
    readyCallback = callback;
  },

  getFriends: function (callback) {

    var picUrlFromId = function (userId) {
      return "http://graph.facebook.com/" + userId + "/picture?type=normal&width=100&height=100";
    };

    var getFriendData = function () {
      var accessToken = Meteor.user().services.facebook.accessToken;
      FB.api("/me/friends?access_token=" + accessToken, function (r) {
        var friends = r.data.map(function(friend) {
          return {
            name: friend.name,
            pic: picUrlFromId(friend.id)
          }
        });
        callback(friends);
      });
    }
    var tryGetFriendData = function () {
      if (Meteor.user()) {
        getFriendData();
      } else {
        Meteor.setTimeout(tryGetFriendData, 500);
      }
    }
    tryGetFriendData();

  }
}
