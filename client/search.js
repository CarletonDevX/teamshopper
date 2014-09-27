Template.ShoppingList.rendered = function () {

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
        key: 'J5PsS2XGuqCnkdQq0Let6RSfvU7oyPwF',
        storeId: 'T1211'
      },
      success: function (result, status, xhr) {
        var rawResults = result['CatalogEntryView'];
        var newList = rawResults.map(function (x, i, arr) {
          return {
            partNumber: x.partNumber,
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

  function onClickItem (partNumber) {
    return function () {
      Items.insert({
        shopping_list_id: 1,
        name: partNumber
      });
    }
  }

  function shoveToDOM (el) {
    return function (listOfResults) {
      $('.search-results li').remove();
      for (var i = 0; i < listOfResults.length; i++) {
        var searchResult = $('<li>' + listOfResults[i]['title'] + '</li>');
        $(searchResult).click(onClickItem(listOfResults[i]['partNumber']));
        $('#search-wrapper .search-results').append(searchResult);
      };
    }
  }

  $('#input').keydown($.throttle(250, function (e) {
    $('.search-results').remove();
    if(!$.inArray(e.keyCode,[13,16,17,18,19,20,27,35,36,37,38,39,40,91,93,224])){return;}
    var resultsList = $('#search-wrapper .search-results');
    if (!resultsList.length) {
      resultsList = $('<ul class="search-results"></ul>');
      $('#search-wrapper').append(resultsList);
    } else {
      resultsList = resultsList[0];
    }
    getTarget($('#input').val(), shoveToDOM(resultsList));
  }));

};
