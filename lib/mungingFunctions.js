function scooterMunger(response, latitude, longitude) {
  const preMungedResponse = JSON.parse(response.text).data.bikes;

  //Use 0.003degrees as 300m in lat/long coordinates alchemy coords 45.5233858, -122.6809206
  // this could have been managed with a .filter and a .map. right now you're basically using .map as a foreach, instead of using the array which .map returns.
  return preMungedResponse
    .filter(oneScoot => 
      Number(
        oneScoot.lat) < (Number(latitude) + 0.003) 
        && Number(oneScoot.lat) > (Number(latitude) - 0.003) 
        && Number(oneScoot.lon) < (Number(longitude) + 0.003) 
        && Number(oneScoot.lon) > (Number(longitude) - 0.003)
    ).map(oneScoot => ({
      lat: oneScoot.lat,
      lon: oneScoot.lon
    }));
}

module.exports = {
  scooterMunger
};
