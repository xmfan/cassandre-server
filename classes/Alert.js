var Coordinate = require('./Coordinate.js');

module.exports = function Alert(lat, lng, dB, key, map) {
  this.coord = new Coordinate(lat, lng);
  this.dB = dB;
  this.ip = key; // denormalized for faster shallow copy of map entries
  this.timerID = (function() {
    return setTimeout(selfDestruct, 500);

    function selfDestruct() {
      map.delete(key);
    }
  })();
};
