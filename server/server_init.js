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

// ServiceConfiguration.configurations.remove({
//   service: "facebook"
// });

// ServiceConfiguration.configurations.insert({
//   service: "facebook",
//   appId: "311391665715533",
//   secret: "76c0d1014c482561c6366d4c006f59c4"
// });
