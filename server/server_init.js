// Initialize test data
if (Meteor.isServer) {

  var clearDB = function () {
    Items.remove({});
    Groups.remove({});
    ShoppingLists.remove({});
    FacebookAccounts.remove({});
  }

  Meteor.startup(function () {
    clearDB();
  });

}
