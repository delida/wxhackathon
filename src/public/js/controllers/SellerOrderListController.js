
angular.module('BlocksApp').controller('SellerOrderListController',
		function($stateParams, $rootScope, $scope, $http, $state) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			var pageSize = 20;
			
			//判断登录
			$scope.checkLogin = function() {
				//var userAddr = "0x6f366fef44bff173620fb56e8f394a999d1cc172";
				var userAddr = getCookie("verifyFlag");
				if (userAddr == null) {
					console.log("未登录或会话过期！");
					window.location.href= "http://" + window.location.host + "/home";
				}
				return userAddr;
			}
			//查询卖出列表
			$scope.reloadScList = function(userAddr) {
				$http({
					method : 'POST',
					url : '/getSellerOrderList',
					data : {
						"userAddr":userAddr,
						"pageNum" : "1",
						"pageSize" : pageSize
					}
				}).success(function(data) {
					var totalPage = 0;
					var orderCount = data.orderList.count;
					
					if (orderCount % pageSize == 0) {
		        		totalPage = orderCount/pageSize;
		        	} else {
		        		totalPage = Math.ceil(orderCount/pageSize);
		        	}
		          $scope.orderList = data.orderList.orderData;
		          $scope.totalPage = totalPage;
		          $('#totalPage').attr('value', totalPage);
		          $scope.pageNum = 1;
		          $scope.pageSize = pageSize;
		          $("#pagination2").hide();
				});
    			
			}
			
			var userAddr = $scope.checkLogin();//判断登录
			$scope.currentUser = userAddr;
			$scope.reloadScList(userAddr);
			

		})

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

