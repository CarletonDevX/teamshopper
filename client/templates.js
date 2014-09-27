var shoppingListInput = "shopping_list_input";
var shoppingListSubmit = "shopping_list_submit";
Template.ShoppingList.inputField = shoppingListInput;
Template.ShoppingList.inputSubmit = shoppingListSubmit;

Template.ShoppingList.items = function () {
  return Items.find();
}

shoppingListEvents = {};
shoppingListEvents["click ." + shoppingListSubmit] = function () {
  var itemName = $("." + shoppingListInput).val();
  Items.insert({
    shopping_list_id: 1,
    name: itemName
  });
};
Template.ShoppingList.events(shoppingListEvents);
