/**
 * Created by tapan on 6/20/2014.
 */

var express   = require('express');
var app       = express();
var weather   = require('./Weather.js');
var constants = require('./Constants.js');

var weatherData = {};
var localResponse;
var queryData;

function handleRequest(request, response)
{
    var city  = queryData[constants.CITY];
    var state = queryData[constants.STATE];

    localResponse = response;

    weatherData = {}; // Re-initialize it so that we clear previous results
    var weatherQuery = {};

    if ('All' == city && 'All' == state) {
        weatherQuery = constants.ALL_WEATHER;
    }
    else {
        weatherQuery[state] = city;
    }

    weather.sendWeatherRequest(weatherQuery, handleWeatherResponse);
    setTimeout(publishWeatherData, constants.WEATHER_API_TIMEOUT); // Execute this function after timeout.
}

function handleWeatherResponse(res)
{
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });

    res.on('end', function () {
        // console.log('BODY: ' + data);
        var weatherObj = weather.parseWeatherData(data);
        if (weatherObj != undefined) {
            var location = weatherObj['location'];
            weatherData[location] = weatherObj;
        }
    })
}

// Render weather data in HTML table format
function publishWeatherData()
{
    localResponse.render('WeatherPage', {weatherData : weatherData});
}

function logParams(request, response, next)
{
    var qs = require('querystring');
    queryData = require('url').parse(request.url, true).query;

    if (Object.keys(queryData).length != 0) {
        console.log('Requested parameters: ' + qs.stringify(queryData));
        next();
    }

    if (request.method == 'POST') {
        var data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });

        request.on('end', function () {
            var post = qs.parse(data);
            if (Object.keys(post).length != 0) {
                queryData = post;
                console.log('Requested parameters : ' + data);
                next();
            }
        });
    }
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(logParams); //define middleware to log request parameters
app.use('/Weather', handleRequest); // define weather get URL

var server = app.listen(constants.LOCAL_PORT, function () {
    console.log('Listening on port %d', server.address().port);
});