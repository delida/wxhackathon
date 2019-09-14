angular.module('BlocksApp',  [ 'ui.bootstrap' ]).controller('IndexController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();
    });
    
    
})





