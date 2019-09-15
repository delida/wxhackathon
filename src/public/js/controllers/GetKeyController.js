angular.module('BlocksApp').controller('GetKeyController',    
		function($stateParams, $rootScope, $scope, $http) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			$scope.checkLogin = function() {
				//var userAddr = "0x6f366fef44bff173620fb56e8f394a999d1cc172";
				var userAddr = getCookie("verifyFlag");
				if (userAddr == null) {
					console.log("未登录或会话过期！");
					window.location.href= "http://" + window.location.host + "/home";
				}
				return userAddr;
			}
			
			$scope.getKey = function (address) {
				if (address != null) {
					$http({
					      method: 'POST',
					      url: '/getKey',
					      data: {"address": address}
					    }).success(function(data) {
					    	$scope.privateKey = data.privateKey;
					    	$scope.keyStore = data.keyStore;
					    	//alert("私钥：" + data.privateKey + ", keyStore:" + data.keyStore);
					    	
					    });
				}
				
			}
			
			var userAddr = $scope.checkLogin();
			$scope.currentUser = userAddr;
		});


var getCookie = function (name) {
	  var localStorage = window.localStorage;
  try {
    let o = JSON.parse(localStorage[name])
    if (!o || o.expires < Date.now()) {
      return null
    } else {
      return o.value
    }
  } catch (e) {
      // 兼容其他localstorage 
    console.log(e)
    return localStorage[name]
  } finally {
  }
}

