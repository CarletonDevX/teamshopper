Accounts.ui.config({
  requestPermissions: {
    facebook: ['email', 'public_profile', 'user_friends', 'publish_actions']
  }
});

Template.Login.rendered = function () {
  var tryContinue = function () {
    if (Meteor.user()) {
      Router.go('Home');
    } else {
      Meteor.setTimeout(tryContinue, 500);
    }
  }
  tryContinue();
};
