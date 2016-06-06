module.exports = function Coordinate(lat, lng) {
  this.lat = lat;
  this.lng = lng;
  this.addToThis = function(coord, weight) {
    this.lat += weight * coord.lat;
    this.lng += weight * coord.lng;
  }
};
