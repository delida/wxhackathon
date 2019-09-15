angular.module('BlocksApp', []).controller('MainBoardController',
	function ($stateParams, $rootScope, $scope, $http,$filter) {
		$scope.$on('$viewContentLoaded', function () {
			App.initAjax();
		});
		$scope.checkLogin = function () {
			var userAddr = getCookie("verifyFlag");
			if (userAddr == null || userAddr == undefined) {
				alert($filter('i18n')('session_expired'));
				window.location.href = "http://" + window.location.host + "/home";
			}
			return userAddr;
		}

		// 获取所有可买商品
		$scope.getSellingProducts = function () {
			$http({
				method: 'POST',
				url: '/getSellingProducts',
			}).success(function (data) {
				console.log(data);
				if (data != "0") {
					$scope.sellingProducts = data;
				} else {
					console.log("获取在售商品列表失败");
				}

			});
		}

		// 获取我发布的商品
		$scope.getAllMyProducts = function () {
			$http({
				method: 'POST',
				url: '/getAllMyProducts',
				data: { "userAddr": userAddr }
			}).success(function (data) {
				if (data != "0") {
					$scope.allMyProducts = data;
					//console.log("get all my product data",data);
				} else {
					console.log("获取我发布的商品列表失败！");
				}

			});
		}

		$scope.updateProductStatus = function (productId, status) {
			var userAddr = $scope.checkLogin();
			if (userAddr != null) {
				$http({
					method: 'POST',
					url: '/updateProductStatus',
					data: { "productId": productId, "status": status, "userAddr": userAddr }
				}).success(function (data) {
					if (data != "0" && data != "2") {
						alert($filter('i18n')('operation_success'));
						$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('showup_product_TX_hash')}: <a href="${microExplorer}${data}" target="_blank">${data}</p>`);
					} else if (data == "2" && loggedIn) {
						loggedIn = false;
						console.log("未登录或会话过期！");
						window.location.href = "http://" + window.location.host + "/home";

					} else if (!loggedIn){
						alert($filter('i18n')('operation_fail'));
					}

				});
			}
		}

		// 发布商品
		$scope.toPublish = function () {
			if ($scope.checkLogin() != null) {
				window.location.href = "http://" + window.location.host + "/publish";
			}
		}

		// 购买
		$scope.buyProduct = function (pid,price, seller) {
			var userAddr = $scope.checkLogin();
			if (userAddr != null) {
//				if (userAddr == seller) {
//					$('body').toast({
//						class: 'error',
//						message:$filter('i18n')('cannot_purchase_own_product')
//					});
//					return;
//				}
				var isOwnerPro = $scope.isOwnerPro(userAddr,pid);
				if(isOwnerPro){
					$("#tips_msg").html($filter('i18n')('buy_tips'));
					$('#go_history').attr('href','/buyerOrderList/'+pid); 
					$("#go_history").show();
		    		$("#tipsWindows").show();
		    		return;
				}
				
				
				$("#createOrder").show();
				$http({
					method: 'POST',
					url: '/buyProduct',
					data: { "userAddr": userAddr,"pid": pid, "price": price, "buyer": userAddr }
				}).success(function (data) {
					$("#createOrder").hide();
					if (data!="0") {
						$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('place_order_TX_hash')}: <a href="${microExplorer}${data}" target="_blank">${data}</p>`);
						$('body').toast({
							class: 'success',
							message: $filter('i18n')('order_success')
						});
					} else {
						$('body').toast({
							class: 'error',
							message:$filter('i18n')('order_fail')
						});
					}
				});
				setTimeout(function(){
					$("#createOrder").hide();
				}, 2000) //停2秒
			}
		}

		$scope.getResource = function (url) {
			//window.location.href= accessToken;
			$http({
				method: 'POST',
				url: '/getResource',
				data: { "url": url }
			}).success(function (data) {
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

		$scope.getKey = function (address) {
			if (address != null) {
				$http({
					method: 'POST',
					url: '/getKey',
					data: { "address": address }
				}).success(function (data) {
					$scope.privateKey = data.privateKey;
					$scope.keyStore = data.keyStore;
					//alert("私钥：" + data.privateKey + ", keyStore:" + data.keyStore);
					$('.ui.basic.modal').modal('show');
				});
			}
		}
		
		//获取余额
		$scope.getTokenBalance = function (address) {
			console.log(1);
			$http({
				method: 'POST',
				url: '/getTokenBalance',
				data: { "address": address }
			}).success(function (data) {
				if (data != "") {
					console.log(data);
					$("#moacblance").html(data);
				} else {
					$scope.moacBalance = "获取余额失败";
					console.log("获取账户余额失败！");
				}

			});
		}
		
		

		var userAddr = $scope.checkLogin();
		$scope.currentUser = userAddr;
		//$scope.getSellingProducts();
		$scope.getTokenBalance(userAddr);
		
		var admin = getCookie("verifyAdmin");
		$scope.admin = admin;
    	console.log('MainBoardController user', userAddr);	
    	
    	
    	//打开授权页面
    	$scope.openeAuth = function (id) {
    		$("#pro_id").html(id);
    		$("#pid").val("id");
    		$("#authAddress").show();
    	}
    	//关闭授权页面
    	$scope.closeAuth = function (id) {
    		$("#address").val("");
    		$("#authAddress").hide();
    	}
    	//打开提示页面
    	$scope.openTips = function (pid) {
    		var userAddr = $scope.checkLogin();
			if (userAddr != null) {
				var isOwnerPro = $scope.isOwnerPro(userAddr,pid);
				if(isOwnerPro){
					$("#tips_msg").html($filter('i18n')('buy_tips'));
					$('#go_history').attr('href','/buyerOrderList/'+pid); 
					$("#go_history").show();
		    		$("#tipsWindows").show();
		    		return;
				}else{
					$("#tips_msg").html($filter('i18n')('auth_tips'));
		    		$("#tipsWindows").show();
				}
			}
			
    		
    	}
    	//关闭提示页面
    	$scope.closeTips = function () {
    		$("#tipsWindows").hide();
    		$("#go_history").hide();
    	}
    	
    	//商品授权
    	$scope.authProduct = function (address) {
    		var pid = $("#pro_id").text();
			var userAddr = $scope.checkLogin();
			if (userAddr != null) {
				if (userAddr == address) {
					$('body').toast({
						class: 'error',
						message:$filter('i18n')('cannot_purchase_own_product')
					});
					return;
				}
				var isOwnerPro = $scope.isOwnerPro(address,pid);
				if (isOwnerPro) {
					$('body').toast({
						class: 'error',
						message:$filter('i18n')('cannot_auth_product')
					});
					return;
				}
				$("#createOrder").show();
				$http({
					method: 'POST',
					url: '/buyProduct',
					data: { "userAddr": userAddr,"pid": pid,"price": 0, "buyer": address }
				}).success(function (data) {
					$("#createOrder").hide();
					if (data!="0") {
						$(".logs>.ui.message").append(`<p style='text-align:left'>${$filter('i18n')('place_order_TX_hash')}: <a href="${microExplorer}${data}" target="_blank">${data}</p>`);
						$('body').toast({
							class: 'success',
							message: $filter('i18n')('order_success')
						});
					} else {
						$('body').toast({
							class: 'error',
							message:$filter('i18n')('order_fail')
						});
					}
				});
				setTimeout(function(){
					$("#createOrder").hide();
				}, 2000) //停2秒
			}
		}
    	
    	//判断商品是否已拥有
		$scope.isOwnerPro = function(address,pid) {
			var flag = false;//默认 false: 未拥有
			$.ajax({
				method : 'POST',
				url : '/getBuyerOrderList',
				data : {"userAddr":address},
				async:false
			}).success(function(data) {
				data = JSON.parse(data);
				var dataList = data.orderList.orderData;
				for(var i in dataList){
					if(pid == dataList[i].Pid){
						flag = true;//true: 已拥有
						break;
					}
				}
			});
			return flag;
		}
    	
    	
	});



