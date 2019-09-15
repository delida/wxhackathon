
angular.module('BlocksApp').controller('BuyerOrderListController',
		function($stateParams, $rootScope, $scope, $http, $state) {
			$scope.$on('$viewContentLoaded', function() {
				App.initAjax();
			});
			
			var pageSize = 20;
			var pid = $stateParams.pid;
			
			
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
						if(pid!=null){
							var dataList = data.orderList.orderData;
							for(var i in dataList){
								if(pid == dataList[i].Pid){
									var array = [];
									array[0] = dataList[i];
									$scope.orderList = array;
									break;
								}
							}
						}else{
							$scope.orderList = data.orderList.orderData;
						}
			          $scope.totalPage = totalPage;
			          $('#totalPage').attr('value', totalPage);
			          $scope.pageNum = 1;
			          $scope.pageSize = pageSize;
			          $("#pagination2").hide();
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
			
			var userAddr = $scope.checkLogin();//判断登录
			$scope.currentUser = userAddr;
			$scope.reloadScList(userAddr);
			
			
			//文件下载
			$scope.dowloadFile = function (hash,type,file) {
				console.log(hash);
				if(type==1){
					type=free;
				}else if(type==2){
					type='authorize'
				}else if(type==3){
					type='buy'
				}
				console.log(type);
				DownLoadFile({
					url:'/downloadFile', //请求的url
					data:{ "hash": hash,"type":type,"filename":file }//要发送的数据
				});
			}
			

		})
		
		var DownLoadFile = function(options) {
			var config = $.extend(true, {method : 'post'}, options);
			var $iframe = $('<iframe id="down-file-iframe" />');
			var $form = $('<form target="down-file-iframe" method="' + config.method
					+ '" />');
			$form.attr('action', config.url);
			for ( var key in config.data) {
				$form.append('<input type="hidden" name="' + key + '" value="'+ config.data[key] + '" />');
			}
			$iframe.append($form);
			$(document.body).append($iframe);
			$form[0].submit();
			$iframe.remove();
		}

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