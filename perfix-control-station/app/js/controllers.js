var perfixControlStation = angular.module('prefixControlStationApp', []);

perfixControlStation.controller('PrefixControlStationCtrl', function ($scope) {
    var peer = new Peer('perf-test-server-2', {key: 'pu0g0mdqm66zjjor'});

    peer.on('connection', function (conn) {
        conn.on('data', function (data, data2) {
            $scope.$apply(
                function () {
                    console.log(data);
                    $scope.data = JSON.parse(data);
                }
            );
        });
    });

    $scope.data = {};
    $scope.data.name = 'PerFix rendering benchmark. There are no results yet.';
});