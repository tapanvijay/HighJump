/**
 * Created by tapan on 6/30/2014.
 */

var http = require('http');
var constants = require('./Constants.js');

function sendWeatherRequest(weatherQuery, handleWeatherResponse)
{
    for (var state in weatherQuery) {
        var city = weatherQuery[state];

        var options = constants.weatherOptions(state, city);
        //console.log("Get data using URL: http://" + options['host'] + options['path']);
        var req = http.request(options, handleWeatherResponse);

        req.on('socket', function (socket) {
            socket.setTimeout(constants.WEATHER_API_TIMEOUT);
            socket.on('timeout', function() {
                console.log("Timeout, aborting request");
                req.abort();
            });
        });

        req.on('error', function (error) {
            console.log('Problem with request: ' + error.message);
        });

        req.write('data\n');
        req.end();
    }
}

function parseWeatherData(data)
{
    try {
        var results = JSON.parse(data);
        var error = results['response']['error'];
        if (typeof error != 'undefined') {
            console.log("Error returned: " + error['description']);
        }
        else {
            var current_observation = results['current_observation'];
            if (typeof current_observation != 'undefined') {
                var location = current_observation['display_location']['full'];
                var temp_f = current_observation['temperature_string'];
                var humidity = current_observation['relative_humidity'];
                var feel_temp = current_observation['feelslike_string'];
                var weather = current_observation['weather'];
                var update_time = current_observation['observation_time'];
                var weatherObj = {
                    "location"  : location,
                    "weather"   : weather,
                    "temp"      : temp_f,
                    "feel_temp" : feel_temp,
                    "humidity"  : humidity,
                    "time"      : update_time
                };

                return weatherObj;
            }
        }
    }
    catch (e) {
        console.log("Failed to parse data: " + e.message);
    }

    return;
}

module.exports = {
    sendWeatherRequest: sendWeatherRequest,
    parseWeatherData:   parseWeatherData
};
