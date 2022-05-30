const fetch = require('node-fetch');
const cfg = require('../config.json');

const url = `https://api.openweathermap.org/data/2.5/weather?lat=${cfg.location.lat}&lon=${cfg.location.long}&appid=${cfg.weatherAPIKey}&units=${cfg.units}`;

module.exports = async () => {
    const req = await fetch(url);
    const res = await req.json();
    return res;
}