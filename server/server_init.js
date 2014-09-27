// Initialize test data
if (Meteor.isServer) {

  var clearDB = function () {
    Items.remove({});
    Groups.remove({});
    ShoppingLists.remove({});
  }

  Meteor.startup(function () {
    clearDB();
    ShoppingLists.insert({
      title: "Test list 1",
      index: 1
    });
  });

}
