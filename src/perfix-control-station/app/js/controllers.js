var perfixControlStation = angular.module('prefixControlStationApp', []);

perfixControlStation.controller('PrefixControlStationCtrl', function($scope) {
    var peer = new Peer('perf-test-server', {key: 'perfix'});
    var conn = peer.connect('perf-test-client');
    conn.on('data', function(data){
        $scope = data;
    });

    $scope.name = 'Should we use CSS3 transition on every item or move them together?';
    $scope.triesNumber = 100;
    $scope.tests = [
        {
            name: '1',
            averageDelay: '22',
            averageJanks: '1.33',
            minDelay: '1',
            maxDelay: '2',
            triesCompleted: '78'
        }
    ];
});