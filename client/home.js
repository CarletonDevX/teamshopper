Template.Home.inputSubmit = 'js-submit';

Template.Home.shoppingLists = function () {
  if (Meteor.user()) {
    return ShoppingLists.find({user_ids: Meteor.user()._id});
  }
}

Template.Home.events({
  'click .js-submit': function () {
    var index = ShoppingLists.find({user_ids: Meteor.user()._id}).count() + 1;
    ShoppingLists.insert({
      title: "New list " + index,
      user_ids: [Meteor.user()._id]
    });
    $('html, body').animate({scrollTop: $('.js-submit').position().top-$(window).height()+$('.js-submit').height()+56}, 400);
    // $('.js-submit').css('top', '-110px').animate({top: '0'}, 500, 'easeOut');
  }
});
