function scooterMunger(response, latitude, longitude) {
  const preMungedResponse = JSON.parse(response.text).data.bikes;
  const filteredArray = [];

  //Use 0.003degrees as 300m in lat/long coordinates alchemy coords 45.5233858, -122.6809206
  preMungedResponse.map(oneScoot => {
    if(Number(oneScoot.lat) < (Number(latitude) + 0.003) && Number(oneScoot.lat) > (Number(latitude) - 0.003) && Number(oneScoot.lon) < (Number(longitude) + 0.003) && Number(oneScoot.lon) > (Number(longitude) - 0.003)) {
      const filteredObj = {};
      filteredObj.lat = oneScoot.lat;
      filteredObj.lon = oneScoot.lon;
      filteredArray.push(filteredObj);
    }
  });
  return filteredArray;
}

module.exports = {
  scooterMunger
};
