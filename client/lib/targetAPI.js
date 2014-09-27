
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

targetAPI = {
  devId: "f10aa86b665e6385fda70e39e6725db5",
  apiKey: "03564f3d3ef34107e73e1c1ec5b775d3",
  key: "957c2c43e08e8cde0c48bebd594bb1a5",

  combinations2: function (numArr) {
    var combinations = [];
     for (var i = 0; i < numArr.length; i++) {
       for (var j = i + 1; j < numArr.length; j++) {
         combinations.push([numArr[i], numArr[j]])
       };
     };
    return combinations;
  },

  factorial: function (num) {
    var rval=1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
  },

  request: function(url, method, data, cb){
    var config = {
      url: url,
      data: JSON.stringify(data),
      success: cb,
      headers: {
        "Content-Type":"text/plain",
      },
      // error: cb,
      type: method
    };

    epicConfig = config;

    return $.ajax(config);
  },

  searchNearby: function(lat,lng,cb){
    return this.request("http://api.target.com:80/v2/store?nearby={0},{1}&range=30&key={2}".format(lat,lng,this.key), "GET", {}, cb);
  },

  individualStore: function(storeId, cb) {
    return this.request("http://api.target.com/v2/location/{0}?key={1}".format(storeId,this.key), "GET", {}, cb);
  },

  storePromos: function(storeId, cb) {
    return this.request("http://api.target.com:80/v1/promotions/weeklyad/storeslugs?storeref={0}&key={1}".format(storeId,this.key), "GET", {}, cb);
  },

  productIdsToObj: function(productIds) {
    productIds = productIds.map(function(item){ return {"productId":item}; });
    return {"products": productIds};
  },

  productSearch: function(storeId, query, cb) {
    return this.request("http://www.tgtappdata.com/v1/gen2spec/search/outside/{0}/{1}".format(storeId,query.replace(" ", "+")), "GET", {}, cb);
  },

  compareRoutes: function(route1, route2) {
    var deltaX, deltaY, dist, thisPoint, nextPoint;


    deltaX = route1[0][0] - route1[route1.length - 1][0];
    deltaY = route1[0][1] - route1[route1.length - 1][1];
    var route1Sum = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
    for(var i = 0; i < route1.length - 1; i++){
      thisPoint = route1[i];
      nextPoint = route1[i+1];

      deltaX = nextPoint[0] - thisPoint[0];
      deltaY = nextPoint[1] - thisPoint[1];
      dist = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
      route1Sum = route1Sum + dist;
    }

    deltaX = route2[0][0] - route2[route2.length - 1][0];
    deltaY = route2[0][1] - route2[route2.length - 1][1];
    var route2Sum = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
    for(var j = 0; j < route2.length - 1; j++){
      thisPoint = route2[j];
      nextPoint = route2[j+1];

      deltaX = nextPoint[0] - thisPoint[0];
      deltaY = nextPoint[1] - thisPoint[1];
      dist = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
      route2Sum = route2Sum + dist;
    }

    if (route1Sum < route2Sum) { return true; } else { return false; }
  },

  findRoute: function(coordinatePairs, cb) {
    var t = coordinatePairs;
    var tBest, tPrime, noChange;

    var edgePairsIndexArray = new Array(coordinatePairs.length);

    for(var i = 0; i < edgePairsIndexArray.length; i++){
      edgePairsIndexArray[i] = i;
    }

    var edgePairsCombinations = this.combinations2(edgePairsIndexArray);

    do {
      noChange = true;
      tBest = JSON.parse(JSON.stringify(t));

      for(var j = 0; j < edgePairsCombinations.length; j++ ){
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
      t = JSON.parse(JSON.stringify(tBest));
    } while(!noChange);

    var deltaX, deltaY, dist;
    var longestIdx = t.length-1;
    deltaX = t[t.length - 1][0] - t[0][0];
    deltaY = t[t.length - 1][1] - t[0][1];
    var longest = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
    for(var i = 0; i < t.length - 1; i++){
      deltaX = t[i][0] - t[i + 1][0];
      deltaY = t[i][1] - t[i + 1][1];
      dist = Math.pow(Math.pow(deltaX,2) + Math.pow(deltaY,2), 0.5);
      if (dist > longest) {
        longest = dist;
        longestIdx = i;
      }
    }

    return cb(t, longestIdx);
  },

  getMapForProductsAtStore: function(productIds, storeId, cb) {
    var self = this;
    return this.request(
      "http://api.target.pointinside.com:80/search/v1.1/product/lookup?devId={0}&storeId={1}&apiKey={2}".format(this.devId,storeId,this.apiKey),
      "POST", 
      self.productIdsToObj(productIds), 
      function(result) {
        var venueId = result.results[0].product.locations[0].venue;
        var coordinatePairs = result.results.map(function(item){
          return [item.product.locations[0].x, item.product.locations[0].y];
        });

        self.request(
          "http://api.target.pointinside.com/feeds/maps/v1.1/venues/{0}/zoneImages?devId={1}&apiKey={2}".format(venueId,self.devId,self.apiKey), 
          "GET", 
          {}, 
          function(result){
            var svgItem = result.data.filter(function(item){
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

            return cb(imageUrl, coordinatePairsAdjusted);
          });
      });
  },

  addMapToElement: function(elementToAppendTo, productIds, storeId, cb) {
    var self = this;
    return this.getMapForProductsAtStore(productIds, storeId, function(
      imageUrl, 
      coordinatePairsAdjusted){
      return self.request(imageUrl+"?apiKey={0}&devId={1}".format(self.apiKey,self.devId), "GET", {}, function(result) {
        elementToAppendTo.append($('svg',result));
        /// find svg element and add circles
        var svg = $('svg',elementToAppendTo);
         
        for(var i = 0; i < coordinatePairsAdjusted.length; i++) {
          var pair = coordinatePairsAdjusted[i]
          superSVG = svg;
          var circle1 = '<circle cx="{0}" cy="{1}" fill="#FF0000" r="70"/>'.format(pair[0],pair[1]);
          var circle2 = '<circle cx="{0}" cy="{1}" fill="#FFFFFF" r="50"/>'.format(pair[0],pair[1]);
          var circle3 = '<circle cx="{0}" cy="{1}" fill="#FF0000" r="30"/>'.format(pair[0],pair[1]);
          var formattedCircle1 = $(circle1);
          var formattedCircle2 = $(circle2);
          var formattedCircle3 = $(circle3);
          svg.append(formattedCircle1);
          svg.append(formattedCircle2);
          svg.append(formattedCircle3);
        }

        self.findRoute(coordinatePairsAdjusted, function(shortestPath, longestIdx){

          for (var i = 0; i < shortestPath.length; i++) {
            if (i === longestIdx) {
              continue;
            }
            var currentPoint = shortestPath[i];
            var nextPoint = shortestPath[(i === shortestPath.length - 1 ? 0 : i+1)];
            var line = '<line x1="{0}" y1="{1}" x2="{2}" y2="{3}" stroke="#FF0000" stroke-width="20"/>'.format(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]);
            var formattedLine = $(line);
            svg.append(formattedLine);
          }

          $('svg').width(800).height(800);
          $('body').html($('body').html()) // manual reflow

          return cb(svg);
        });
      });
    });
  }
};

//module.exports(targetAPI) if node