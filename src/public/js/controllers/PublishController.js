angular.module('BlocksApp').controller('PublishController',    
		function($stateParams, $rootScope, $scope, $http,$filter) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			//$scope.url = "http://192.168.10.167:8080/api/checkSign";
			$scope.url = "https://test-business.yucunkeji.com/api/v2/external/block/verifySign";
			$scope.checkLogin = function() {
				 var userAddr = getCookie("verifyFlag");
				//var userAddr = "0x6f366fef44bff173620fb56e8f394a999d1cc172";
				if (userAddr == null) {
					console.log("未登录或会话过期！");
					window.location.href= "http://" + window.location.host + "/home";
				}
				return userAddr;
			}
			
			
			$scope.publish = function (name, provide, introduce) {
				var userAddr = $scope.checkLogin();
				var type = $('#type option:selected') .val();
				var price = $("#price").val();
				var hash = $("#hash").val();
				var file_name = $("#file_name").val();
				if (userAddr != null) {
					$("#publishProduct").show();
					$http({
					      method: 'POST',
					      url: '/publish',
					      data: {"name": name, "provide": provide, "type": type, "price": price, 
					    	  "introduce": introduce, "hash": hash,"file_name": file_name, "userAddr": userAddr}
					    }).success(function(data) {
					    	$("#publishProduct").hide();
					    	if (data != "0" && data != "2") {
					    		// alert("操作成功，请10秒后刷新页面查看！");
					    		$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('publish_TX_hash')}: <a href="${microExplorer}${data}" target="_blank">${data}</p>`);
					    		$('body').toast({
									class: 'success',
									message: $filter('i18n')('publish_success')
								});
					    		//window.location.href= "http://" + window.location.host + "/mainBoard";
					    	} else if (data == "2"){
					    		console.log("未登录或会话过期！");
								window.location.href= "http://" + window.location.host + "/home";
					    		
					    	} else {
					    		alert($filter('i18n')('operation_fail'));
					    	}
					    	
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
