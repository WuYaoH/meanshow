/**
 * Created by fanghua on 2015/7/13.
 */
/**
 * Created by seal on 7/3/15.
 */


angular
    .module('alert',[])
    .controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
        //$scope.closeable = 'close' in $attrs;
        $scope.closeable = $attrs.close;
        this.close = $scope.close;
    }])

    .directive('alert', function () {
        return {
            restrict:'EA',
            controller:'AlertController',
            templateUrl:'common/alert/alert.html',
            transclude:true,
            replace:true,
            scope: {
                type: '@',
                close: '&'
            }
        };
    })

    .directive('dismissOnTimeout', ['$timeout', function($timeout) {
        return {
            require: 'alert',
            link: function(scope, element, attrs, alertCtrl) {
                $timeout(function(){
                    console.log('time out');
                    alertCtrl.close();
                }, parseInt(attrs.dismissOnTimeout, 10));
            }
        };
    }]);