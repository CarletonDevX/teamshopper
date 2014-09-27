Template.Home.inputSubmit = 'js-submit';

Template.Home.shoppingLists = function () {
  return ShoppingLists.find({user_ids: [Meteor.user()._id]});
}

Template.Home.events({
  'click .js-submit': function () {
    var index = ShoppingLists.find({user_ids: [Meteor.user()._id]}).count() + 1;
    ShoppingLists.insert({
      title: "Test list " + index,
      index: index,
      user_ids: [Meteor.user()._id]
    });
  }
});
