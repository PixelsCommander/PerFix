(function (w) {
    var JANK_LIMIT = 20;

    var PerfomanceTest = function (options) {
        this.id = options.id;
        this.name = options.name;
        this.before = options.before;
        this.action = options.action;
        this.timeout = options.timeout;
        this.delay = options.delay || 0;
        this.group = options.group;
        this.index = options.index;

        if (this.group !== undefined) {
            this.statistics = options.statistics;
        } else {
            this.statistics = localStorage[this.name]
        }


        this.currentDelay = 0;

        this.result = {};
        this.result.averageDelay = 0;
        this.result.janksNumber = 0;
        this.result.minDelay = 0;
        this.result.maxDelay = 0;

        this.delaySum = 0;
        this.data = [];
        this.janks = [];

        this._lastFrameTime = 0;
        this._currentFrameTime = 0;

        this.tick = this.tick.bind(this);
        this.stop = this.stop.bind(this);
        this.initiateTest = this.initiateTest.bind(this);
    }

    var p = PerfomanceTest.prototype;

    p.test = function () {
        if (this.before !== undefined) {
            this.before();
        }

        //Relayouting to apply preparation changes to DOM
        document.body.offsetHeight;

        //Resetting if was stopped before
        this.stopped = false;

        //Starting test
        setTimeout(this.initiateTest, this.delay);
    }

    p.initiateTest = function () {
        //Executing test action
        this.action();

        //Starting RAF loop
        requestAnimationFrame(this.tick);

        if (this.timeout !== undefined) {
            setTimeout(this.stop, this.timeout);
        }
    }

    p.stop = function () {
        this.stopped = true;
    }

    p.tick = function () {
        this._currentFrameTime = performance.now();

        if (this._lastFrameTime !== 0) {
            this.currentDelay = this._currentFrameTime - this._lastFrameTime;

            if (this.currentDelay > JANK_LIMIT) {
                this.addJunk(this.currentDelay);
            }

            this.addData(this.currentDelay);

            if (this.result.minDelay === 0) {
                this.result.minDelay = this.currentDelay;
            } else {
                this.result.minDelay = Math.min(this.result.minDelay, this.currentDelay);
            }

            this.result.maxDelay = Math.max(this.result.maxDelay, this.currentDelay);
        }

        this._lastFrameTime = this._currentFrameTime;

        if (this.stopped !== true) {
            requestAnimationFrame(this.tick);
        } else {
            this.completed();
        }
    }

    p.addData = function (deltaTime) {
        this.data.push(parseFloat(deltaTime.toFixed(2)));
        this.delaySum += deltaTime;
        this.result.averageDelay = this.delaySum / this.data.length;
    }

    p.addJunk = function (deltaTime) {
        this.janks.push(deltaTime);
        this.result.janksNumber++;
    }

    p.completed = function () {
        this.updateStatistics();

        if (this.group) {
            this.group.testCompleted();
        } else {
            this.saveResultToLocalStorage();
        }
    }

    p.saveResultToLocalStorage = function () {
        JSON.stringify(this.statistics);
    }

    p.updateStatistics = function () {
        if (this.statistics === undefined || this.statistics === '') {
            this.statistics = {};
            this.statistics.tries = 0;
            this.statistics.averageDelaySum = 0;
            this.statistics.janksNumberSum = 0;
            this.statistics.minDelaySum = 0;
            this.statistics.maxDelaySum = 0;
            this.statistics.result = {};
            this.statistics.result.averageDelay = 0;
            this.statistics.result.janksNumber = 0;
            this.statistics.result.minDelay = 0;
            this.statistics.result.maxDelay = 0;
        } else {
            if (typeof this.statistics === 'string') {
                this.statistics = JSON.parse(this.statistics);
            }
        }

        this.statistics.tries++;
        this.statistics.averageDelaySum += this.result.averageDelay;
        this.statistics.janksNumberSum += this.result.janksNumber;
        this.statistics.minDelaySum += this.result.minDelay;
        this.statistics.maxDelaySum += this.result.maxDelay;
        this.statistics.result.averageDelay = this.statistics.averageDelaySum / this.statistics.tries;
        this.statistics.result.janksNumber = this.statistics.janksNumberSum / this.statistics.tries;
        this.statistics.result.minDelay = this.statistics.minDelaySum / this.statistics.tries;
        this.statistics.result.maxDelay = this.statistics.maxDelaySum / this.statistics.tries;
    }

    p.logTestResult = function () {
        console.group(this.name);
        console.log(this.result);
        console.log(this.data);
        console.log(this.statistics.result);
        console.groupEnd();
    }

    w.PerfomanceTest = PerfomanceTest;
})(window);

(function(){

    // prepare base perf object
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }

    if (!window.performance.now){

        var nowOffset = Date.now();

        if (performance.timing && performance.timing.navigationStart){
            nowOffset = performance.timing.navigationStart
        }


        window.performance.now = function now(){
            return Date.now() - nowOffset;
        }

    }

})();