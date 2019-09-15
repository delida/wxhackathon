
angular.module('BlocksApp').controller('SellerTokenListController',
		function($stateParams, $rootScope, $scope, $http, $state) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			var pageSize = 20;
			var orderId = $stateParams.orderId;
			
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
			//查询购买列表
			$scope.reloadScList = function(userAddr) {
					$http({
						method : 'POST',
						url : '/getSellerOrderList',
						data : {
							"userAddr":userAddr
						}
					}).success(function(data) {
						var dataList = data.orderList.orderData;
						for(var i in dataList){
							if(orderId == dataList[i].Oid){
								var arrObject = new Array();
								for(var tokenid in dataList[i].Tokenid){
									var address = $scope.getTokenOwner(dataList[i].Tokenid[tokenid]);
									var jsonObject = {"Oid":dataList[i].Oid,"tokenid":dataList[i].Tokenid[tokenid],"TokenOwner":address,"Name":dataList[i].Name,"Url":dataList[i].Url,"Status":dataList[i].Status[tokenid]};
									arrObject.push(jsonObject);
								}
								$scope.tokenList = arrObject;
							}
						}
					});
			}
			
			//获取token所属人
			$scope.getTokenOwner = function(tokenid) {
				var address;
				$.ajax({
					method : 'POST',
					url : '/getTokenOwner',
					data : {"tokenid":tokenid},
					async:false
				}).success(function(data) {
					address = data
				});
				return address;
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