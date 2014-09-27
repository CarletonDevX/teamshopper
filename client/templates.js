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

Template.ShoppingList.rendered(function () {
  Session.set('listIndex', parseInt($('div#data-index').attr('data-index')));
});

Template.ShoppingList.items = function () {
  var list = ShoppingLists.findOne(Session.get('listIndex')) || {_id: null};
  return Items.find({shopping_list_id: list._id});
}
