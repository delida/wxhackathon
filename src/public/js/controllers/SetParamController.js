angular.module('BlocksApp').controller('SetParamController',    
		function($stateParams, $rootScope, $scope, $http) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			// params： yc返回示例{"companyName":"1&1&公司名称", "startDate": "1&1&开始日期"};
			// finalparams:
			$scope.url = $stateParams.url;
			$scope.params = $stateParams.params;
			
			$scope.finalParams = getJsonArr($stateParams.params);
			
			$scope.accessTokenKey = $stateParams.accessTokenKey;
			$scope.accessTokenValue = $stateParams.accessTokenValue;
			
			$scope.buyer = $stateParams.buyer;
			$scope.seller = $stateParams.seller;
			$scope.tokenId = $stateParams.tokenId;
			$scope.orderId = $stateParams.orderId;
			$scope.method = $stateParams.method;
			if ($scope.url == null || $scope.params == null ||
					$scope.accessTokenKey == null || $scope.accessTokenValue == null) {
				alert("当前页面不可直接访问！");
				window.location.href= "http://" + window.location.host + "/mainBoard";
			}
			
			$scope.getCheckResult = function () {
				var ajaxbg = $("#scbackground,#progressBar");
				ajaxbg.show(); 
				$http({
					method : 'POST',
					url : '/getCheckResult',
					data : {
						"buyer": $scope.buyer,
						"seller": $scope.seller,
						"orderId": $scope.orderId,
						"tokenId": $scope.tokenId
					}
				}).success(function(data) {
					ajaxbg.hide(); 
					
					var transferTx = data.split("&")[0]; 
					var updateTx = data.split("&")[1];
					$(".ui.message").append(`<p style='text-align:left'>转账erc721交易哈希为: <a href="${microExplorer}${transferTx}" target="_blank">${transferTx}</p>`);
					$(".ui.message").append(`<p style='text-align:left'>更新订单状态交易哈希为: <a href="${microExplorer}${updateTx}" target="_blank">${updateTx}</p>`);
					var paramStr = "?";
					$scope.finalParams.forEach(function (item) {
						// 如果是数组类型，则加上[]
						if (item.paramType == 0) {
							paramStr += item.paramName + "=[" + $("#" + item.paramName).val() + "]&";
						} else {
							paramStr += item.paramName + "=" + $("#" + item.paramName).val() + "&";
						}
						
					});
					$scope.result = encodeURI($scope.url + paramStr + "&accessTokenKey=" + $scope.accessTokenKey 
					+ "&accessTokenValue=" + $scope.accessTokenValue + "&method=" + $scope.method);
					// 禁止二次获取资源
					$("#getResourceUrlBtn").attr('disabled',true);
				});
			}
			
			$scope.getResource = function (url) {
				$http({
				      method: 'POST',
				      url: '/getResource',
				      data: {"url": url}
				    }).success(function(data) {
				    	if (data == "0") {
				    		alert("获取不到资源！")
				    	} else if (data == "2") {
				    		alert("资源服务器出错！")
				    	} else if (data == "3") {
				    		alert("链接已过期！")
				    	} else if (data == "4") {
				    		alert("不合法的链接格式！")
				    	}
				    	else {
				    		alert(JSON.stringify(data));
				    	}
				    	
				    });
				
			}
			
			
});

var getJsonArr = function (jsonObj) {
	var jsonArr = [];
	for (var key in jsonObj) {
		var json = {};
		json.paramName = key;
		keyValue = jsonObj[key].split("&");
		if (keyValue[0] != null && keyValue[0] != undefined) {
			json.isRequire = keyValue[0];
		} else {
			json.isRequire = 1;
		}
		
		if (keyValue[1] != null && keyValue[1] != undefined) {
			json.paramType = keyValue[1];
		} else {
			json.paramType = 1;
		}
		
		if (keyValue[2] != null && keyValue[2] != undefined) {
			json.remark = keyValue[2];
		} else {
			json.remark = "";
		}
		
		jsonArr.push(json);
	}
	return jsonArr;
}



