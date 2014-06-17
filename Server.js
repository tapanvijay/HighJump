/**
 * Created by tapan on 6/20/2014.
 */

var express = require('express');
var http    = require('http');
var app     = express();

var weatherData;
var resultsCount;
var localResponse;
var queryData;

function handleRequest(request, response)
{
    var city = queryData['city'];
    var state = queryData['state'];
    localResponse = response;

    weatherData = {};
    var weatherQuery = {};
    if ('All' == city && 'All' == state) {
        weatherQuery["CA"] = "Campbell";
        weatherQuery["NE"] = "Omaha";
        weatherQuery["TX"] = "Austin";
        weatherQuery["MD"] = "Timonium";
        resultsCount = 4;
    }
    else {
        weatherQuery[state] = city;
        resultsCount = 1;
    }

    sendWeatherRequest(weatherQuery);
}

function sendWeatherRequest(weatherQuery)
{
    for (var state in weatherQuery) {
        var city = weatherQuery[state];

        var options = {
            host: 'api.wunderground.com',
            path: '/api/056f3d38d10f7793/conditions/q/' + state + '/' + city + '.json'
        };

        // console.log("Get data using URL: http://" + options['host'] + options['path']);
        var req = http.request(options, handleWeatherResponse);

        req.on('error', function () {
            console.log('Problem with request: ' + error.message);
        });

        req.write('data\n');
        req.end();
    }
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
        try {
            // console.log('BODY: ' + data);
            resultsCount--; // Response have come, reduce result count
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
                        "weather"   : weather,
                        "temp"      : temp_f,
                        "feel_temp" : feel_temp,
                        "humidity"  : humidity,
                        "time"      : update_time};
                    weatherData[location] = weatherObj;
                    // console.log("Current temperature in " + location + " is: " + temp_f);
                }
            }
        }
        catch (e) {
            console.log("Failed to parse data: " + e.message);
            return;
        }

        if (resultsCount == 0) {
            // All responses have arrived, publish weather data
            publishWeatherData();
        }
    })
}

function publishWeatherData()
{
    // Write weather data in HTML table format
    localResponse.writeHead(200, {'Content-Type': 'text/html'});
    localResponse.write("<h1>Weather Data</h1>");
    localResponse.write("<table BORDER=\"30\" CELLPADDING=\"10\" CELLSPACING=\"3\" BORDERCOLOR=\"00FF00\" >");
    localResponse.write("<tr>");
    localResponse.write("<td>Location</td>");
    localResponse.write("<td>Weather</td>");
    localResponse.write("<td>Temperature</td>");
    localResponse.write("<td>Feel Temperature</td>");
    localResponse.write("<td>Humidity</td>");
    localResponse.write("<td>Update Time</td>");
    localResponse.write("</tr>");
    for (var location in weatherData) {
        localResponse.write("<tr>");
        var weatherObj = weatherData[location];
        localResponse.write("<td>" + location + "</td>");
        localResponse.write("<td>" + weatherObj['weather'] + "</td>");
        localResponse.write("<td>" + weatherObj['temp'] + "</td>");
        localResponse.write("<td>" + weatherObj['feel_temp'] + "</td>");
        localResponse.write("<td>" + weatherObj['humidity'] + "</td>");
        localResponse.write("<td>" + weatherObj['time'] + "</td>");
        localResponse.write("</tr>");
    }
    localResponse.end("</table>");
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

app.use(logParams); //define middleware to log request parameters
app.use('/Weather', handleRequest); // define weather get URL
var server = app.listen(8124, function () {
    console.log('Listening on port %d', server.address().port);
});