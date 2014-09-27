var getCurrentList = function () {
  return ShoppingLists.findOne(Session.get('listId'));
}

Template.GoShopping.title = function () {
  return (getCurrentList() || {'title': ''}).title;
}

Template.GoShopping.dismahshit = function () {
  var cl = getCurrentList();
  if (cl) {
    var itms = Items.find({shopping_list_id: Session.get('listId')}).fetch();
    var accu = 0;
    for (var i = 0; i < itms.length; i++) {
      accu += parseInt(itms[i].price * itms[i].count);
    };
    return parseInt(accu * 0.5);
  } else {
    return 15;
  }
}

Template.GoShopping.rendered = function () {

  var listId = $('div#data-id-more').attr('data-id');
  Session.set('listId', listId);

  function getTarget (text, callback) {
    if (text.trim() === '') {
      return;
    }
    $.ajax({
      url: 'https://api.target.com/v2/store',
      data: {
        nearby: text,
        key: 'J5PsS2XGuqCnkdQq0Let6RSfvU7oyPwF',
        limit: 12,
        range: 60
      },
      dataType:"jsonp",
      headers:{
        'Content-Type':'application/json',
        "Access-Control-Allow-Origin":"*",
        "Accept":"application/json"
      },
      success: function (result, status, xhr) {
        if(result.Locations['@count'] === 0){return;}
        var rawResults = result.Locations.Location;
        var newList = rawResults.map(function (x, i, arr) {
          return {
            name: x.Name,
            id: x.ID,
          };
        })
        var newNewList = [];
        var ze_data = JSON.stringify({
          products: Items.find({shopping_list_id: Session.get('listId')}).fetch().map(function (x, i, arr) {
            return {productId: x.product_code};
          })
        });
        for (var i = 0; i < newList.length; i++) {
          newList[i]
          var config = {
            url: 'http://api.target.pointinside.com:80/search/v1.1/product/lookup?devId=f10aa86b665e6385fda70e39e6725db5&apiKey=03564f3d3ef34107e73e1c1ec5b775d3&storeId=' + newList[i].id,
            data: ze_data,
            type: "POST",
            headers:{
              "Content-Type":"application/json",
              "Accept":"application/json"
            },
            async: false
          }
          var result = JSON.parse($.ajax(config).responseText);
          if (result.status !== "OK") {
            continue;
          }

          var allThere = true;
          for (var j = 0; j < result.results.length; j++) {
            allThere = allThere && (result.results[j].lookupStatus === "FOUND");
          }

          if (allThere) {
            newNewList.push(newList[i]);
          }
        }
        return callback(newNewList);
      },
      error: function (xhr, status, error) {
        // TODO - probs ignore
      }
    });
  }

  function onClickItem (id) {
    return function () {
      var items = Items.find({shopping_list_id: Session.get('listId')}).fetch().map(function (x, i, arr) {
        return x.product_code;
      });
      $('.search-results').remove();
      $('#search-bar').val('');

      console.log("TARGET CALL:");
      console.log(items);
      console.log(parseInt(id));
      targetAPI.addMapToElement(
        $('#MAPIT'),
        items,
        parseInt(id),
        function() {});
    }
  }

  function shoveToDOM (el) {
    return function (listOfResults) {
      $('.spinner').fadeOut(600);
      Meteor.setTimeout(function () {
        $('.spinner').remove();
      }, 700);
      console.dir(listOfResults);
      $('.search-results li').remove();
      for (var i = 0; i < listOfResults.length; i++) {
        var searchResult = $('<li>' + listOfResults[i]['name'] + '</li>');
        $(searchResult).click(
          onClickItem(
            listOfResults[i]['id']
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
    if ($('.spinner').length === 0) {
      var spinner = new Spinner({color: "#333"}).spin();
      document.getElementById('search-wrapper').appendChild(spinner.el);
    }
    getTarget($('#search-bar').val(), shoveToDOM(resultsList));
  }));

};
