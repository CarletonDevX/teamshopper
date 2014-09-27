Template.Home.inputSubmit = 'js-submit';

Template.Home.shoppingLists = function () {
  return ShoppingLists.find();
}

Template.Home.events({
  'click .js-submit': function () {
    var index = ShoppingLists.find().count() + 1;
    ShoppingLists.insert({
      title: "Test list " + index,
      index: index
    });
  }
});
