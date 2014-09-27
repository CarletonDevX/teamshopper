var getCurrentList = function () {
  return ShoppingLists.findOne(Session.get('listId'));
}

Template.ShoppingList.title = function () {
  return (getCurrentList() || {'title': ''}).title;
}

Template.ShoppingList.items = function () {
  var list = getCurrentList() || {_id: null};
  return Items.find({shopping_list_id: list._id});
}

Template.ShoppingList.friendSpaces = function () {
  return [1,1,1,1,1,1,1,1,1,1,1,1,1,1];
}

Template.ShoppingList.addedFriends = function () {
  var allFriends = Session.get('friends');
  if (allFriends) {
    return allFriends.filter(function (friend) {
      var fbAccount = FacebookAccounts.findOne({facebook_id: friend.id});
      return fbAccount && getCurrentList().user_ids.indexOf(fbAccount.user_id) != -1;
    });
  }
}

Template.ShoppingList.allFriends = function () {
  return Session.get('friends');
}

MeteorFB.onReady(function () {
  MeteorFB.getFriends(function (friends) {
    Session.set('friends', friends);
  });
});

Template.ShoppingList.rendered = function () {

  var listId = $('div#data-id').attr('data-id');
  Session.set('listId', listId);

  function getTarget (text, callback) {
    if (text.trim() === '') {
      return;
    }
    $.ajax({
      url: 'https://api.target.com/v2/products/search',
      data: {
        pageSize: 6,
        responseFormat: 'json',
        searchTerm: text,
        key: 'J5PsS2XGuqCnkdQq0Let6RSfvU7oyPwF'
      },
      success: function (result, status, xhr) {
        var rawResults = result['CatalogEntryView'];
        var newList = rawResults.map(function (x, i, arr) {
          return {
            partNumber: x.partNumber,
            productCode: x.DPCI,
            title: x.ItemAttributes[0].Attribute[0].description
          };
        })
        return callback(newList);
      },
      error: function (xhr, status, error) {
        // TODO - probs ignore
      }

    });
  }

  function onClickItem (partNumber, productCode, name) {
    return function () {
      $('.search-results').remove();
      $('#search-bar').val('');
      var list = getCurrentList();
      var select = {
        part_number: partNumber,
        shopping_list_id: list._id,
        product_code: productCode
      };
      var oldObj = Items.findOne(select);
      if (oldObj) {
        Items.update(
          {_id: oldObj._id},
          {
            $set: {
              status: 'need',
              name: name
            },
            $inc: {
              count: 1
            }
          }
        );
      } else {
        select.status = 'need';
        select.name = name;
        select.count = 1;
        Items.insert(select);
      }
    }
  }

  function shoveToDOM (el) {
    return function (listOfResults) {
      $('.search-results li').remove();
      for (var i = 0; i < listOfResults.length; i++) {
        var searchResult = $('<li>' + listOfResults[i]['title'] + '</li>');
        $(searchResult).click(
          onClickItem(
            listOfResults[i]['partNumber'],
            listOfResults[i]['productCode'],
            listOfResults[i]['title']
          )
        );
        $('#search-wrapper .search-results').append(searchResult);
      };
    }
  }

  $('#search-bar').keydown($.throttle(250, function (e) {
    $('.search-results').remove();
    if(!$.inArray(e.keyCode,[13,16,17,18,19,20,27,35,36,37,38,39,40,91,93,224])){return;}
    var resultsList = $('#search-wrapper .search-results');
    if (!resultsList.length) {
      resultsList = $('<ul class="search-results"></ul>');
      $('#search-wrapper').append(resultsList);
    } else {
      resultsList = resultsList[0];
    }
    getTarget($('#search-bar').val(), shoveToDOM(resultsList));
  }));

};

Template.ShoppingList.events({
  'click #items-to-buy .up': function () {
    var id = $(this)[0]._id;
    Items.update({_id: id}, {$inc: {count: 1}});
  },
  'click #items-to-buy .down': function () {
    var id = $(this)[0]._id;
    Items.update({_id: id}, {$inc: {count: -1}});
    if (Items.findOne({_id: id}).count === 0) {
      Items.remove({_id: id});
    };
  },
  'click .addFriend': function () {
    $('.shoppingListContent').toggleClass('sidebarOpen');
  }
});

Template.FriendInSidebar.events({
  'click': function () {
    var fbAccount = FacebookAccounts.findOne({facebook_id: this.id});
    if (fbAccount) {
      var listId = Session.get("listId");
      if (ShoppingLists.findOne(listId).user_ids.indexOf(fbAccount.user_id) == -1) {
        ShoppingLists.update(listId, {$push: {user_ids: fbAccount.user_id}});
      }
    }
  }
});
