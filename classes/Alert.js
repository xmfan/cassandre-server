const Coordinate = require('./Coordinate.js');

// Stored in alertMap, Alert destroys itself after >=3 seconds
module.exports = function Alert(lat, lng, dB, key, map) {
  this.coord = new Coordinate(lat, lng);
  this.dB = dB;
  this.timestamp = key; // denormalized for faster shallow copy of map entries
  this.timerID = (function() {
    return setTimeout(selfDestruct, 500);

    function selfDestruct() {
      map.delete(key);
    }
  })();
};
