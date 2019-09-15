
angular.module('BlocksApp').controller('BuyerTokenListController',
		function($stateParams, $rootScope, $scope, $http, $state,$filter) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			var pageSize = 20;
			var orderId = $stateParams.orderId;
			
			//判断登录
			$scope.checkLogin = function() {
				//var userAddr = "0xe7e52b94e9a82351302260ec39a300e9f00aee4c";
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
						url : '/getBuyerOrderList',
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
									var jsonObject = {"Oid":dataList[i].Oid,"tokenid":dataList[i].Tokenid[tokenid],"TokenOwner":address,"Name":dataList[i].Name,
											"Url":dataList[i].Url,"third": dataList[i].Third,"Status":dataList[i].Status[tokenid], "Seller": dataList[i].Seller};
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
			
			$scope.getAccessToken = function (orderId, tokenId, name, url, seller, third) {
				var userAddr = $scope.checkLogin();
				$("#retriveData").show();
				$http({
					method : 'POST',
					url : '/getAccessToken',
					data : {
						"orderId":orderId,
						"tokenId":tokenId,
						"productNo":third,
						"url":url,
						"buyer":userAddr,
						"seller": seller
						
					}
				}).success(function(data) {
					if (data != "0" && data != "2") {
						if (data.params != null && data.params != undefined 
								&& data.params != "" && data.params != {} && data.params != []) {
							// 带有可变参数
							$("#retriveData").hide();
							$state.go("setParam",{"url": data.url, "params": data.params,
								"accessTokenKey": data.accessTokenKey,"accessTokenValue": data.accessTokenValue, 
								"method": data.method, "buyer": userAddr, "seller": seller, "orderId":orderId, "tokenId":tokenId});
						} else {
							// 无参
							$("#retriveData").hide();
							var transferTx = data.txs.split("&")[0]; 
							var updateTx = data.txs.split("&")[1];
							$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('erc721_hash')}: <a href="${microExplorer}${transferTx}" target="_blank">${transferTx}</p>`);
							$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('update_TX_status_hash')}: <a href="${microExplorer}${updateTx}" target="_blank">${updateTx}</p>`);
							diyAlert(data.url + "&&accessTokenKey=\n" + data.accessTokenKey + 
									"&accessTokenValue=\n" + data.accessTokenValue + "&method=" + data.method);
						}
						
					} else if (data == "2") {
						$("#retriveData").hide();
			    		alert($filter('i18n')('session_expired'));
						window.location.href= "http://" + window.location.host + "/home";
			    		
			    	} else if (data == "0"){
							$("#retriveData").hide();
						alert($filter('i18n')('operation_fail'));
					}
				});
			}
			
			$scope.getResource = function (url) {
				
				$http({
				      method: 'POST',
				      url: '/getResource',
				      data: {"url": url}
				    }).success(function(data) {
				    	if (data == "0") {
								alert($filter('i18n')('error_retirve_resource'))
				    	} else if (data == "2") {
				    		alert($filter('i18n')('error_server'))
				    	} else if (data == "3") {
				    		alert($filter('i18n')('error_link_expired'))
				    	} else if (data == "4") {
				    		alert($filter('i18n')('error_illegal_link'))
				    	}
				    	else {
				    		alert(JSON.stringify(data));
				    	}
				    	
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

function diyAlert(e){
    $("body").append('<div id="msg"><div id="msg_top">accessToken<span class="msg_close">×</span></div><div id="msg_cont">'+e+'</div><div class="msg_close" id="msg_clear">确定</div></div>');
    $(".msg_close").click(function (){
    $("#msg").remove();
    });
}