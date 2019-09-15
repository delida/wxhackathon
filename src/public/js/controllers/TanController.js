angular.module('BlocksApp',  [ 'ui.bootstrap' ]).controller('TanController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();
    });
    
    $scope.items = [ 'item1', 'item2', 'item3' ];
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl : 'myModalContent.html',
            controller : ModalInstanceCtrl,
            resolve : {
                items : function() {
                    return $scope.items;
                }
            }
        });
        modalInstance.opened.then(function() {// 模态窗口打开之后执行的函数
            console.log('modal is opened');
        });
        modalInstance.result.then(function(result) {
            console.log(result);
        }, function(reason) {
            console.log(reason);// 点击空白区域，总会输出backdrop
            // click，点击取消，则会暑促cancel
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    
    
    var ModalInstanceCtrl = function($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.selected = {
            item : $scope.items[0]
        };
        $scope.ok = function() {
            $modalInstance.close($scope.selected);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    };
    
    
    
})





