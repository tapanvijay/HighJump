/**
 * Created by tapan on 7/2/2014.
 */

var expect = require('chai').expect;
var weather = require("../Weather.js");
var fs = require('fs');

describe("Weather", function(){
    describe("#parseWeatherData()", function(){
        it("should parse result data", function(){
            var data = fs.readFileSync('test/TestData', 'utf8');
            var weatherData = weather.parseWeatherData(data);
            expect(weatherData).to.have.a.property("location", "Sunnyvale, CA");
            expect(weatherData).to.have.a.property("weather", "Clear");
            expect(weatherData).to.have.a.property("temp", "63.7 F (17.6 C)");
            expect(weatherData).to.have.a.property("feel_temp", "63.7 F (17.6 C)");
            expect(weatherData).to.have.a.property("humidity", "74%");
            expect(weatherData).to.have.a.property("time", "Last Updated on July 2, 10:32 PM PDT");
        });
    });
});

describe("Weather", function(){
    describe("#sendWeatherRequest()", function(){
        var weatherObj;
        it("send weather request", function(done) {
            var weatherQuery = { CA: 'Campbell'};
            weather.sendWeatherRequest(weatherQuery, function(res) {
                res.setEncoding('utf8');
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    expect(data).to.not.equal("undefined");
                    weatherObj = weather.parseWeatherData(data);
                    done();
                })
            });
        });

        function done() {
            expect(weatherObj).to.not.equal("undefined");
            expect(weatherObj).to.have.a.property("location", "Campbell, CA");
            // Other weather details are not constant so can't verify
        }
    });
});