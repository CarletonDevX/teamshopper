Router.configure({
  layoutTemplate: 'ApplicationLayout'
});

Router.map(function () {

  this.route('Login', {
    path: '/'
  });

  this.route('Home');

  this.route('ShoppingList', {
    path: '/list'
  });

});
