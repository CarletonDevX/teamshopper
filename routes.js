Router.configure({
  layoutTemplate: 'Main',
  loadingTemplate: 'Loading',
  notFoundTempalte: 'NotFound',
  load: function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
    $('.content').hide().fadeIn(1000);
  }
});

var redirectIfNotLoggedIn = function () {
  var user = Meteor.user();
  if (!user) {
    if (!Meteor.loggingIn()) {
      Router.go('Login');
    }
  } else {
    // If logged in, make sure we have a FacebookAccount for this user
    MeteorFB.onReady(function () {
      MeteorFB.getFacebookId(function (facebookId) {
        if (!FacebookAccounts.findOne({facebook_id: facebookId})) {
          FacebookAccounts.insert({
            facebook_id: facebookId,
            user_id: user._id
          });
        }
      });
    });
  }
}

Router.map(function () {

  this.route('Login', {
    path: '/',
    onBeforeAction: function () {
      if (Meteor.user()) {
        Router.go('Home');
      }
    }
  });

  this.route('Home', {
    onBeforeAction: redirectIfNotLoggedIn,
  });

  this.route('ShoppingList', {
    path: '/list/:_id',
    onBeforeAction: redirectIfNotLoggedIn,
    data: function () {
      return { id: this.params._id };
    }
  });

  this.route('PostItem', {
    action: function () {
      debugger
      console.log(this);
    }
  });

});
