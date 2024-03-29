var getCurrentList = function () {
  return ShoppingLists.findOne(Session.get('listId'));
}

Template.ShoppingList.title = function () {
  var list = getCurrentList();
  return list && list.title || null;
}

Template.ShoppingList.items = function () {
  var list = getCurrentList();
  return list && Items.find({shopping_list_id: list._id});
}

Template.ShoppingList.hasItems = function () {
  var list = getCurrentList();
  return list && Items.find({shopping_list_id: list._id}).count() > 0;
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

  // Move sidebar for longer sidebar-ness
  $('.friendsSidebar').appendTo('.wrapper');

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
            title: x.ItemAttributes[0].Attribute[0].description,
          };
        })
        console.log(newList);
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
      var price = Math.floor(Math.random() * 11) + 2;
      var select = {
        part_number: partNumber,
        shopping_list_id: Session.get('listId'),
        product_code: productCode
      };
      var oldObj = Items.findOne(select);
      if (oldObj) {
        Items.update(
          {_id: oldObj._id},
          {
            $set: {
              status: 'need',
              name: name,
              price: price
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
        select.price = price;
        var itemId = Items.insert(select);
        Meteor.setTimeout(function () {
          $('.dragdealer').each(function () {
            new Dragdealer("drag" + itemId, {
              loose: true
            });
          });
        });
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
    var id = this._id;
    Items.update(id, {$inc: {count: 1}});
  },
  'click #items-to-buy .down': function () {
    var id = this._id;
    Items.update(id, {$inc: {count: -1}});
    if (Items.findOne(id).count === 0) {
      Items.remove(id);
    };
  },
  'click .addFriend': function () {
    $('.shoppingListContent').toggleClass('sidebarOpen');
    $('.friendsSidebar').toggleClass('sidebarOpen');
    $('.addFriend').toggleClass('sidebarOpen');
  },
  'focus .js-list-title-input': function () {
    var titleDisplay = $('.js-list-title-display');
    var titleInput = $('.js-list-title-input');
    titleInput.val(titleDisplay.text().trim());
    titleDisplay.hide();
    titleInput.show();
  },
  'blur .js-list-title-input': function () {
    var titleDisplay = $('.js-list-title-display');
    var titleInput = $('.js-list-title-input');
    var title = titleInput.val().trim();
    ShoppingLists.update(Session.get("listId"), {$set: {title: title}});
    titleInput.val('');
    titleDisplay.show();
  },
  'focus #search-bar': function () {
    $('.footer').hide();
    // if ($('.search-results').length > 0) {
    //   console.log('yay');
    //   $('.search-results').show();
    // }
  },
  'blur #search-bar': function () {
    $('.footer').show();
  }
});

Template.ShoppingListItem.rendered = function () {
  $('.dragdealer').each(function () {
    new Dragdealer($(this).attr('id'), {
      loose: true
    });
  });
};

Template.ShoppingListItem.events({
  'mouseup': function () {
    console.log(this);
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
