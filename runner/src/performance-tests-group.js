(function (w) {
    var PerformanceTestsGroup = function (options) {
        this.name = options.name;
        this.triesNumber = options.triesNumber;
        this.currentTry = options.currentTry;
        this.currentTestID = options.currentTestID;
        this.currentTestIndex = this.getTestIndex(this.currentTestID, options.testsDescription);
        this.currentTest = undefined;
        this.runner = options.runner;

        if (this.currentTry === 0 && this.currentTestIndex === 0) {
            this.resetLocalStorage();
        }

        this.statistics = this.getStatisticsFromLocalStorage();
        this.tests = this.getTestsFromDescription(options.testsDescription);
    }

    var p = PerformanceTestsGroup.prototype;

    p.test = function () {
        this.currentTest = this.getCurrentTest();

        if (this.currentTest !== undefined) {
            this.currentTest.test();
        }
    }

    p.getCurrentTest = function() {
        if (this.currentTry !== undefined && this.currentTestID !== undefined) {
            for (var i = 0; i < this.tests.length; i++) {
                var obj = this.tests[i];
                if (obj.id === this.currentTestID) {
                    return obj;
                }
            }
        }
    }

    p.getTestIndex = function(testID, tests) {
        for (var i = 0; i < tests.length; i++) {
            var obj = tests[i];
            if (obj.id === testID) {
                return i;
            }
        }
    }

    p.testCompleted = function () {
        this.saveResultToLocalStorage();
        this.logTestResult();

        if (this.runner !== undefined) {
            this.runner.proceed();
        }
    }

    p.saveResultToLocalStorage = function () {
        this.statistics = this.getStatisticsFromTests();
        localStorage[this.name] = JSON.stringify(this.statistics);
    }

    p.logTestResult = function () {
        console.group(this.name);

        for (var i in this.statistics) {
            if (this.statistics[i] !== undefined) {
                console.group(i);
                var result = this.statistics[i].result;
                console.log(result);
                console.groupEnd(i);
            }
        }

        console.groupEnd();
    }

    p.resetLocalStorage = function () {
        localStorage[this.name] = '';
    }

    p.getStatisticsFromLocalStorage = function () {
        var dataString = localStorage[this.name];
        if (dataString === undefined || dataString === 'undefined' || dataString === '') {
            return {};
        } else {
            return JSON.parse(dataString);
        }
    }

    p.getTestsFromDescription = function (testsArray) {
        var tests = [];

        for (var i = 0; i < testsArray.length; i++) {
            var currentTest = testsArray[i];
            var testStatistics = this.statistics[currentTest.name];
            currentTest.statistics = testStatistics;
            currentTest.group = this;
            currentTest.index = i;
            tests.push(new PerfomanceTest(currentTest));
        }

        return tests;
    }

    p.getStatisticsFromTests = function () {
        var result = {};

        for (var i = 0; i < this.tests.length; i++) {
            var test = this.tests[i];
            var testName = test.name;

            result[testName] = test.statistics;
        }

        return result;
    }

    p.getDataForControlStation = function () {
        var result = {};
        result.triesNumber = this.triesNumber;
        result.name = this.name;
        result.tests = [];

        for (var i = 0; i < this.tests.length; i++) {
            var test = this.tests[i];
            var dataObject = {};
            dataObject.name = test.name;
            if (test.statistics !== undefined) {
                dataObject.averageDelay = test.statistics.result.averageDelay.toFixed(2);
                dataObject.janksNumber = test.statistics.result.janksNumber.toFixed(2);
                dataObject.minDelay = test.statistics.result.minDelay.toFixed(2);
                dataObject.maxDelay = test.statistics.result.maxDelay.toFixed(2);
            }

            if (this.currentTest.index > test.index) {
                dataObject.triesCompleted = this.triesNumber;
            }

            if (this.currentTest.index < test.index) {
                dataObject.triesCompleted = 0;
            }

            if (this.currentTest.index === test.index) {
                dataObject.triesCompleted = this.currentTry;
            }
            result.tests.push(dataObject);
        }

        return result;
    }

    w.PerformanceTestsGroup = PerformanceTestsGroup;
})(window);