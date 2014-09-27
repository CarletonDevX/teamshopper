if (Meteor.isClient) {

  Template.shoppingList.items = function () {
    return Items.find();
  }

  var shoppingListInput = "shopping_list_input";
  var shoppingListSubmit = "shopping_list_submit";
  Template.shoppingList.inputField = shoppingListInput;
  Template.shoppingList.inputSubmit = shoppingListSubmit;

  shoppingListEvents = {};
  shoppingListEvents["click ." + shoppingListSubmit] = function () {
    var itemName = $("." + shoppingListInput).val();
    Items.insert({ name: itemName });
  };
  console.log(shoppingListEvents);
  Template.shoppingList.events(shoppingListEvents);


}
