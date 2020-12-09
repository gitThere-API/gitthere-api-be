
function mungeLocation(location) {
  return {
    lat: location[0].lat,
    lng: location[0].lon
  };
}

module.exports = {
  mungeLocation
};
