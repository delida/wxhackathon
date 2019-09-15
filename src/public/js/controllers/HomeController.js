angular.module('BlocksApp').controller('HomeController', function($rootScope, $scope, $http, $timeout,$filter) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();
    });
    
    $scope.login = function (address, password) {
		if (address == undefined || password == undefined) {
			
		} else {
			$http({
			      method: 'POST',
			      url: '/login',
			      data: {"address": address, "password": password}
			    }).success(function(data) {
			    	var flag = data.flag;
			    	var admin = data.admin;
			    	if (flag == "1") {
			    		// 登录成功
			    		//alert("登录成功");
			    		setCookie("verifyFlag", address.toLowerCase(), 24);
			    		window.location.href= "http://" + window.location.host + "/mainBoard";
			    		if(admin == "1"){
			    			setCookie("verifyAdmin", true, 24);
			    		}else{
			    			setCookie("verifyAdmin", false, 24);
			    		}
			    	} else if (flag == "0") {
			    		alert($filter('i18n')('password_error'));
			    	} else if (flag == "2") {
			    		alert($filter('i18n')('login_fail_try_keystore'));
			    	} else if (flag == "3"){
			    		alert($filter('i18n')('login_fail_checkInfo'));
			    	}
			    	
			    });
			
		} 
		
	}
    
    $scope.keyStoreLogin = function (keyStore, password) {
    	
		if (keyStore == undefined || password == undefined) {
			
		} else {
			$http({
			      method: 'POST',
			      url: '/keyStoreLogin',
			      data: {"keyStore": keyStore, "password": password}
			    }).success(function(data) {
			    	var flag = data.flag;
			    	var admin = data.admin;
			    	if (flag == "1") {
			    		// 登录成功
			    		//alert("登录成功");
			    		setCookie("verifyFlag", "0x" + JSON.parse(keyStore).address.toLowerCase(), 24);
			    		window.location.href= "http://" + window.location.host + "/mainBoard";
			    		if(admin == "1"){
			    			setCookie("verifyAdmin", true, 24);
			    		}else{
			    			setCookie("verifyAdmin", false, 24);
			    		}
			    	} else if (flag == "0") {
			    		alert($filter('i18n')('password_error'));
			    	} else if (flag == "2") {
			    		alert($filter('i18n')('login_fail_try_keystore'));
			    	} else if (flag == "3"){
			    		alert($filter('i18n')('login_fail_checkInfo'));
			    	} else if (flag == "4"){
			    		alert($filter('i18n')('keystore_format_error'));
			    	}
			    	
			    });
			
		} 
		
	}
    
    $scope.register = function (password) {
		if (password == undefined) {
			
		} else {
			$http({
			      method: 'POST',
			      url: '/register',
			      data: {"password": password}
			    }).success(function(data) {
			    	alert($filter('i18n')('register_success') + data.address.toLowerCase());
			    	$("#password1").val("");
			    	$("#password2").val("");
			    	$("#login").trigger("click");
			    	
			    });
			
		} 
		
	}
    
    
})
.directive('pwCheck', function() {
	return {  
        require: 'ngModel',  
        link: function (scope, elem, attrs, ctrl) {  
            var firstPassword = '#' + attrs.pwCheck;  
            $(elem).add(firstPassword).on('keyup', function () {  
                scope.$apply(function () {  
                    var v = $(elem).val()===$(firstPassword).val();  
                    ctrl.$setValidity('pwmatch',v);  
                });  
            });  
        }  
    }
});

var setCookie = function (key, value, hours) {
    // 设置过期原则
	var localStorage = window.localStorage;
    if (!value) {
      localStorage.removeItem(key)
    } else {
      var hours = 1;
      var exp = new Date();
      localStorage[key] = JSON.stringify({
        value,
        expires: exp.getTime() + hours * 60 * 60 * 1000
      })
    }
  }


