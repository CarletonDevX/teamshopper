////////

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

////////

Template.ShoppingList.inputField = 'js-input';
Template.ShoppingList.inputSubmit = 'js-submit';

Template.ShoppingList.items = function () {
  return Items.find();
}

Template.ShoppingList.events({
  'click .js-submit': function () {
    var itemName = $('.js-input').val();
    Items.insert({
      shopping_list_id: 1,
      name: itemName
    });
  },
});
