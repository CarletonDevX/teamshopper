
targetAPI = {
  devId: "f10aa86b665e6385fda70e39e6725db5",
  apiKey: "03564f3d3ef34107e73e1c1ec5b775d3",
  key: "957c2c43e08e8cde0c48bebd594bb1a5"

  request: function(url, method, data, cb){
    $.ajax({
      url: url,
      data: data,
      success: cb,
      error: cb,
      type: method
    });
  }

  searchNearby: function(lat,lng,cb){
    return this.request("http://api.target.com:80/v2/store?nearby=%d,%d&range=30&key=%s".format(lat,lng,this.key), "GET", {}, cb)
  },

  individualStore: function(storeId, cb) {
    return this.request("http://api.target.com/v2/location/%d?key=%s".format(storeId,this.key), "GET", {}, cb)
  },

  storePromos: function(storeId, cb) {
    return this.request("http://api.target.com:80/v1/promotions/weeklyad/storeslugs?storeref=%d&key=%s".format(storeId,this.key), "GET", {}, cb)
  },

  productIdsToObj: function(productIds) {
    var productIds = productIds.map(function(item){ return {"productId":item } })
    return {"products": productIds}
  },

  productSearch: function(productIds, cb) {
    return this.request("http://api.target.com:80/v1/promotions/weeklyad/storeslugs?storeref=%d&key=%s".format(storeId,this.key), "POST", this.projectIdsToObj(productIds), cb)
  },

  findRoute: function(coordinatePairs, cb) {
    
  },

  getMapForProductsAtStore: function(productIds, storeId, cb) {
    return this.request(
      "http://api.target.pointinside.com:80/search/v1.1/product/lookup?devId=%s&storeId=%d&apiKey=%s".format(this.devId,storeId,this.apiKey) 
      "POST", 
      this.projectIdsToObj(productIds), 
      function(result) {
        var venueId = result.results[0].product.locations[0].venue;
        var coordinatePairs = result.results.map(function(item){
          [item.product.locations[0].x, item.product.locations[0].y] 
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
            var coordinatePairsAdjusted = coordinatePairs.map(function(pair){ return [pair[0] * baseRatioX, pair[1] * baseRatioY]; })
            var imageUrl = svgItem.imageUrl;

            cb(imageUrl, coordinatePairsAdjusted);
        });
    })
  },

  addMapToElement: function(elementToAppendTo, productIds, storeId, cb) {
    return this.getMapForProductsAtStore(productIds, storeId, function(imageUrl, coordinatePairsAdjusted){
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
          }
        });
      }
    });
  }
};

//module.exports(targetAPI) if node