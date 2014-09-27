
targetAPI = {
  devId: "f10aa86b665e6385fda70e39e6725db5",
  apiKey: "03564f3d3ef34107e73e1c1ec5b775d3",
  key: "957c2c43e08e8cde0c48bebd594bb1a5",

  combinations: function (numArr, choose) {
    var n = numArr.length;
    var c = [];
    var inner = function(start, choose_) {
        if (choose_ == 0) {
            return c;
        } else {
            for (var i = start; i <= n - choose_; ++i) {
                c.push(numArr[i]);
                inner(i + 1, choose_ - 1);
                c.pop();
            }
        }
    };
    inner(0, choose);
  },

  factorial: function (num) {
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
  },

  request: function(url, method, data, cb){
    $.ajax({
      url: url,
      data: data,
      success: cb,
      error: cb,
      type: method
    });
  },

  searchNearby: function(lat,lng,cb){
    return this.request("http://api.target.com:80/v2/store?nearby=%d,%d&range=30&key=%s".format(lat,lng,this.key), "GET", {}, cb);
  },

  individualStore: function(storeId, cb) {
    return this.request("http://api.target.com/v2/location/%d?key=%s".format(storeId,this.key), "GET", {}, cb);
  },

  storePromos: function(storeId, cb) {
    return this.request("http://api.target.com:80/v1/promotions/weeklyad/storeslugs?storeref=%d&key=%s".format(storeId,this.key), "GET", {}, cb);
  },

  productIdsToObj: function(productIds) {
    productIds = productIds.map(function(item){ return {"productId":item}; });
    return {"products": productIds};
  },

  productSearch: function(storeId, query, cb) {
    return this.request("http://www.tgtappdata.com/v1/gen2spec/search/outside/%d/%s".format(storeId,query.replace(" ", "+")), "GET", {}, cb);
  },

  compareRoutes: function(route1, route2) {
    var deltaX, deltaY, dist, thisPoint, nextPoint;


    var route1Sum = 0;
    for(var i = 0; i <= route1.length - 2; i++){
      thisPoint = route1[i];
      nextPoint = route1[i+1];

      deltaX = Math.abs(nextPoint[0] - thisPoint[0]);
      deltaY = Math.abs(nextPoint[1] - thisPoint[1]);
      dist = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
      route1Sum = route1Sum + dist;
    }

    var route2Sum = 0;
    for(var j = 0; j <= route2.length - 2; j++){
      thisPoint = route2[j];
      nextPoint = route2[j+1];

      deltaX = Math.abs(nextPoint[0] - thisPoint[0]);
      deltaY = Math.abs(nextPoint[1] - thisPoint[1]);
      dist = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
      route2Sum = route2Sum + dist;
    }

    if (route1Sum < route2Sum) { return true; } else { return false; }
  },

  findRoute: function(coordinatePairs, cb) {
    var t = coordinatePairs;
    var tBest, tPrime;
    var noChange = true;

    //var edgePairsIndexArray = new Array(this.factorial(coordinatePairs.length)/2.0/this.factorial(coordinatePairs.length - 2));

    var edgePairsIndexArray = new Array(coordinatePairs.length);

    for(var i = 0; i < edgePairsIndexArray.length; i++){
      edgePairsIndexArray[i] = i;
    }

    var edgePairsCombinations = this.combinations(edgePairsIndexArray, 2);

    do {
      tBest = t;

      for(var j = 0; j <= edgePairsCombinations.length; j++ ){
        var indexOf1 = edgePairsCombinations[j][0];
        var indexOf2 = edgePairsCombinations[j][1];

        tPrime = JSON.parse(JSON.stringify(t));
        var tmp = tPrime[indexOf1];
        tPrime[indexOf1] = tPrime[indexOf2];
        tPrime[indexOf2] = tmp;
        if (this.compareRoutes(tPrime, tBest)) {
          tBest = tPrime;
          noChange = false;
        }
      }
      t = tBest;
    } while(!noChange);

    return cb(t);
  },

  getMapForProductsAtStore: function(productIds, storeId, cb) {
    return this.request(
      "http://api.target.pointinside.com:80/search/v1.1/product/lookup?devId=%s&storeId=%d&apiKey=%s".format(this.devId,storeId,this.apiKey),
      "POST", 
      this.projectIdsToObj(productIds), 
      function(result) {
        var venueId = result.results[0].product.locations[0].venue;
        var coordinatePairs = result.results.map(function(item){
          return [item.product.locations[0].x, item.product.locations[0].y];
        });

        this.request(
          "http://api.target.pointinside.com/feeds/maps/v1.1/venues/%s/zoneImages?devId=%s&apiKey=%s".format(venueId,this.devId,this.apiKey), 
          "GET", 
          {}, 
          function(result){
            var svgItem = result.filter(function(item){
              if(item.imageType == "DEFAULT" && item.mimeType == "image/svg+xml"){
                return true;
              } else {
                return false;
              }
            })[0];
            var baseRatioX = svgItem.baseRatioX;
            var baseRatioY = svgItem.baseRatioY;
            var coordinatePairsAdjusted = coordinatePairs.map(function(pair){ return [pair[0] * baseRatioX, pair[1] * baseRatioY]; });
            var imageUrl = svgItem.imageUrl;

            cb(imageUrl, coordinatePairsAdjusted);
        });
    });
  },

  addMapToElement: function(elementToAppendTo, productIds, storeId, cb) {
    return this.getMapForProductsAtStore(productIds, storeId, function(
      imageUrl, 
      coordinatePairsAdjusted){
      return this.request(imageUrl+"?apiKey=%s&devId=%s".formate(this.apiKey,this.devId), "GET", {}, function(result) {
        elementToAppendTo.append(result);
        /// find svg element and add circles
        var svg = $('svg',elementToAppendTo);
        var circle = '<circle xmlns="http://www.w3.org/2000/svg" cx="%d" cy="%d" fill="#00FF00" r="10"/>'; 
        for(var pair in coordinatePairsAdjusted) {
          svg.append(circle.format(pair[0],pair[1]));
        }

        return this.findPath(coordinatePairsAdjusted, function(shortestPath){
          var line = '<line x1="%d" y1="%d" x2="%d" y2="%d" style="stroke:rgb(255,0,0);stroke-width:2" />';

          for (var i = 0; i <= shortestPath.length - 2; i++) {
            var currentPoint = shortestPath[i];
            var nextPoint = shortestPath[i+1];

            svg.append(line.format(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]));
            return cb(elementToAppendTo);
          }
        });
      });
    });
  }
};

//module.exports(targetAPI) if node