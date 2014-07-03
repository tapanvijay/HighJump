/**
 * Created by tapan on 7/2/2014.
 */

const WEATHER_URL = "api.wunderground.com";
const WEATHER_API = "/api/056f3d38d10f7793/conditions/q/";
const WEATHER_API_TIMEOUT = 2000; // 2000 milliseconds
const LOCAL_PORT = 8124;
const CITY = "city";
const STATE = "state";
const ALL_WEATHER = { CA: 'Campbell', NE: 'Omaha', TX: 'Austin', MD: 'Timonium' };

function weatherOptions(state, city) {
    var options = {
        host: WEATHER_URL,
        path: WEATHER_API + state + '/' + city + '.json'
    };

    return options;
}

module.exports = {
    WEATHER_URL: WEATHER_URL,
    WEATHER_API: WEATHER_API,
    WEATHER_API_TIMEOUT: WEATHER_API_TIMEOUT,
    LOCAL_PORT: LOCAL_PORT,
    ALL_WEATHER: ALL_WEATHER,
    CITY: CITY,
    STATE: STATE,
    weatherOptions: weatherOptions
};