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
  if (!Meteor.user()) {
    if (!Meteor.loggingIn()) {
      Router.go('Login');
    }
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
    path: '/list/:index',
    onBeforeAction: redirectIfNotLoggedIn,
    data: function () {
      return { index: this.params.index };
    }
  });

  this.route('PostItem', {
    action: function () {
      debugger
      console.log(this);
    }
  });

});
