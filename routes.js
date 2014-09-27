Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.map(function () {

  this.route('Home', {
    path: '/'
  });

  this.route('ShoppingList', {
    path: '/list'
  });

});
