Router.configure({
  layoutTemplate: 'Main',
  loadingTemplate: 'Loading',
  notFoundTempalte: 'NotFound',
  load: function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
    $('.content').hide().fadeIn(1000);
  }
});

Router.map(function () {

  this.route('Login', {
    path: '/'
  });

  this.route('Home');

  this.route('ShoppingList', {
    path: '/list/:index',
    data: function () {
      return { index: this.params.index };
    }
  });

  this.route('PostItem', {
    action: function () {
      debugger
      console.log(this);
    }
  });

});
