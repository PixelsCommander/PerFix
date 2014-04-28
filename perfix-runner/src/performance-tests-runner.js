(function (w) {

    var TRIES_PARAM = 'tries';
    var TEST_ID_PARAM = 'testid';

    var PerformanceTestsRunner = function () {
        this.group = {};
    }

    var p = PerformanceTestsRunner.prototype;

    p.describe = function (name, testsDescription, triesNumber) {
        var options = {
            name: name,
            testsDescription: testsDescription,
            triesNumber: triesNumber,
            currentTry: this.getCurrentTry(),
            currentTestID: this.getCurrentTestID(),
            runner: this
        };

        this.group = new PerformanceTestsGroup(options);
        this.group.test();
    }

    p.getCurrentTestID = function () {
        var result = undefined;
        var filename = location.href.replace(/^.*[\\\/]/, '');
        filename = filename.substr(0, filename.lastIndexOf('.'));
        result = getURLParameterByName(TEST_ID_PARAM) || filename;
        return result;
    }

    p.getCurrentTry = function () {
        this.group.currentTry = parseInt(getURLParameterByName(TRIES_PARAM));
        if (this.group.currentTry === undefined || isNaN(this.group.currentTry)) {
            this.group.currentTry = 0;
        }
        return this.group.currentTry;
    }

    p.runNextTry = function () {
        this.reOpen(this.group.currentTest, ++this.group.currentTry);
    }

    p.proceed = function (test, tryNo) {
        if (w.Peer !== undefined) {
            this.sendStatToControlStation();
        } else {
            this.runNextTry();
        }
    }

    p.reOpen = function (test, tryNo) {
        var tryParameter = TRIES_PARAM + '=' + tryNo + '&';

        if (tryNo > this.group.triesNumber) {
            this.runNextTest();
        } else {
            window.location.href = this.getURLFromTest(test) + '?' + tryParameter;
        }
    }

    p.runNextTest = function () {
        if (this.group.currentTest.index < this.group.tests.length - 1) {
            var nextTest = this.group.tests[this.group.currentTest.index + 1];
            this.reOpen(nextTest, 0);
        } else {
            this.logGroupResult();
        }
    }

    p.getURLFromTest = function (test) {
        var currentURL = location.href.substring(0, location.href.lastIndexOf("/") + 1);
        var testID = test.id;
        var testURL = test.URL;
        var result = currentURL + (testURL || testID) + '.html';
        return result;
    }

    p.logGroupResult = function () {
        var minAverage = {
            value: 0
        };
        var minJanky = {
            value: 0
        };

        for (var i in this.group.statistics) {
            var stat = this.group.statistics[i].result;
            var testName = i;

            if (minAverage.value === 0) {
                minAverage.value = stat.averageDelay;
                minAverage.name = testName;
            }

            if (minJanky.value === 0) {
                minJanky.value = stat.janksNumber;
                minJanky.name = testName;
            }

            if (minAverage.value > stat.averageDelay) {
                minAverage.value = stat.averageDelay;
                minAverage.name = testName;
            }

            if (minJanky.value > stat.janksNumber) {
                minJanky.value = stat.janksNumber;
                minJanky.name = testName;
            }
        }

        var messageText = minAverage.name + ' is most performant. ' + minJanky.name + ' is less janky. Look for details in console.'
        alert(messageText);
    }

    p.sendStatToControlStation = function () {
        var peer = new Peer({key: 'pu0g0mdqm66zjjor'});

        var self = this;

        peer.on('open', function(connection){
            var conn = peer.connect('perf-test-server-2');
            conn.on('open', function(){
                var dataToSend = self.group.getDataForControlStation();
                conn.send(JSON.stringify(dataToSend));
                setTimeout(function(){

                    self.runNextTry();
                }, 10);
                peer.disconnect();
            })
        })

    }

    w.perfTest = new PerformanceTestsRunner();

})(window);

function getURLParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.href);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}