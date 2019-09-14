
var BlocksApp = angular.module("BlocksApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "localization"
]);

var microExplorer = 'http://testnet.moac.io/sctx/120.79.30.143&8546&0xd196e7e1344831edc50c7eb5786b202f58a88e94&';

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
        return null;
    } finally {
    }
}

function logout(){
	$('.dropdownContent').transition({ animation: 'drop' });
	setCookie("verifyFlag","",0);
}


BlocksApp.config(['$ocLazyLoadProvider', '$locationProvider',
    function ($ocLazyLoadProvider, $locationProvider) {
        $ocLazyLoadProvider.config({
            cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        });
        $locationProvider.html5Mode({
            enabled: true
        });
    }]);


/* Setup global settings */
BlocksApp.factory('settings', ['$rootScope', '$http', function ($rootScope, $http) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: false, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '/',
        globalPath: '/',
        layoutPath: '/',
    };

    $rootScope.settings = settings;
    return settings;
}]);



/* Setup App Main Controller */
BlocksApp.controller('MainController', ['$scope', '$rootScope','$filter', function ($scope, $rootScope,$filter) {
    $scope.$on('$viewContentLoaded', function () {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
    $rootScope.language = "zh_CN";
    $rootScope.changeLang = function () {
        if ($rootScope.language === "en_US") {
            $rootScope.language = "zh_CN";
        } else {
            $rootScope.language = "en_US";
        }
        console.log("click change lang to", $rootScope.language);
    }
    
    $rootScope.copyToClipboard = function () {
        var copyText = $("#keystore").text();
        $("#clipboard").val(copyText);

        $("#clipboard").select();

        document.execCommand("copy");
        $('body')
            .toast({
                class: 'success',
                message: $filter('i18n')('copy_keystore_success')
            });

    }
    // $scope.goHome = function() {
    //     console.log('goHome');
    //     window.scrollTo({top:0,behavior:"smooth"});
    // };

    // $scope.goBuy = function() {
    //     console.log('goBuy');
    //     window.scrollTo({top:0,behavior:"smooth"});
    // }

    // $scope.goSell = function() {
    //     console.log('goSell');
    //     window.scrollTo({top:0,behavior:"smooth"});
    // }
}]);

angular.module('localization', [])
    .filter('i18n', ['localizedTexts', '$rootScope', function (localizedTexts, $rootScope) {
        var filter =  function (text) {
            currentLanguage = $rootScope.language || 'en_US';
            if (localizedTexts[currentLanguage].hasOwnProperty(text)) {
                // console.log("current text",localizedTexts[currentLanguage][text]);
                return localizedTexts[currentLanguage][text];
            }
            return text;
        };
        
        filter.$stateful = true; // <-- the magic line
        return filter;
    }]);
 

angular.module('localization')
    .value('localizedTexts', {
        'zh_CN': {
            'main_title':"Master Of Data",
            'switch_language':"切换语言",
            'placing_order':"订单创建中...",
            'placing_file':"文件上传Ipfs节点中...",
            'publish_product':"商品发布中...",
            'retriving_resource':"正在获取资源并转移通证权限...",
            //message
            'copy_keystore_success':"拷贝Keystore成功，请手动粘贴到合适的地方并妥善保存",
            'order_success':"下单成功！",
            'cannot_purchase_own_product':"不能购买自己发布的商品",
            'cannot_auth_product':"该用户已拥有此商品，无需再授权于他",
            'operation_success':"操作成功，请10秒后刷新页面查看！",
            'operation_fail':"操作失败",
            'order_fail':"下单失败",
            'error_retirve_resource':"获取不到资源！",
            'error_server':"资源服务器出错！",
            "error_link_expired":"链接已过期！",
            'error_illegal_link':"不合法的链接格式！",
            'publish_success':"操作成功，请10秒后到商品列表中查看！",
            'password_error':"密码错误！",
            'login_fail_try_keystore':'登录失败，请尝试keyStore方式登录！',
            'login_fail_checkInfo':'登录失败，请检查账户或密码！',
            'keystore_format_error':"keyStore格式有误，请检查！",
            'register_success':"注册成功，您的账号是： ",
            'session_expired':"未登录或会话过期！",
            //login
            'login_title':"用户登录",
            'login':"登录",
            "keystore_login":"keystore登录",
            "register":"注册",
            'account':"账户",
            'password':"密码",
            'confirm_password':"确认密码",
            //nav
            'navbar': "导航栏",
            'home': '主页',
            'porduct': "商品",
            'seller': "我是卖家",
            'logs': "显示日志",
            'subchain_explorer': "子链浏览器",
            //table    
            'product_list': "商品列表",
            'purchase_history': "查看买入的历史订单",
            'product_id': "商品ID",
            'seller_address': "卖家地址",
            'Supplier': "数据来源",
            'product': "商品名称",
            'price': "价格",
            'abstract': "商品简介",
            'register_date': "上架时间",
            'quantity': "数量",
            'operation': "操作",
            'buy': "购买",
            'buy_free': "免费购买",
            'release_product': "发布商品",
            'sale_history': "查看卖出的历史订单",
            'purchase_link': "数据文件",
            "product_status": "状态",
            'data_authorize': "数据授权",
            'authorize_address': "授权账户",
            'auth': "授权",
            'tips': "提示",
            'auth_tips': "您可以发送电子邮件向商家申请！",
            'buy_tips': "您已拥有此商品，可以在历史订单使用该商品！",
            //home page
            'instruction': "Demo简介",
            'data_flow_title':"信息流转",
            'data_flow_content':"Master of Data（数据大师）是一个基于MOAC区块链和IPFS分布式存储的汽车数据Demo。此Demo主要实现汽车相关数据的上传，分发，浏览和使用，所有业务逻辑使用智能合约实现。",
            'data_framework_content':"MOAC母子链结构为本Demo提供链端支持。我们只需要实现业务逻辑便可在通用子链上部署和调试。",
            'data_use_content':"本Demo将数据分为三种使用类型，分别是免费数据，授权数据和购买数据。免费数据支持一次点击，立即使用；授权数据需要数据拥有者预授权，然后被授权账户才能使用；购买数据采用MOAC子链原生货币，支付费用后才能使用。此外，点击商品时采用实时ERC721生成，将每个用户的订单都生成一个ERC721通证。",
            'MOAC_blockchain_title':"MOAC区块链",
            'MOAC_blockchain_content':"东南大数据交易中心使用MOAC子链的多合约技术构建了大数据交易平台的核心功能。MOAC平台的基础架构是由一条称为“母链”的主链和众多子链组成的群链组合。使用分片技术，每条子链在母链平台上以子区块链的模式运行，负责智能合约管理。分片技术将整个网络细分为多个分片，只要每个分片中有足够的节点，系统仍然具有高度的安全性。分片技术还允许对并行交易进行安全处理，从而进一步增加每秒交易处理数量（TPS），远超现有区块链解决方案。",
            //buyerorderlist
            'buyerorderlist': "订单列表",
            'back': "返回",
            'orderNum': "订单编号",
            'buyer_address': "买家账号",
            'time_place_order': "交易时间",
            'token_detail': "查看Token详情",
            'file_download': "文件下载",
            //buyer token detail
            'buyertokendetail': "买家Token详情列表",
            'access_to_resources': "获取资源",
            'token_belonger': "Token所属人",
            'token_status': "Token状态",
            'unused': "未使用",
            'used': "已使用",
            'settled': "已结算",
            'to_use':"去使用",
            'publish_TX_hash':"发布记录交易哈希为",
            'showup_product_TX_hash':"上下架操作交易哈希为",
            'place_order_TX_hash':"购买记录交易哈希为",
            'erc721_hash':"转账erc721交易哈希为",
            'update_TX_status_hash':"更新订单状态交易哈希为",
            //publish page
            'productNum': "商品编号",
            'submit': "提交",
            'type': "类型",
            'source':"数据来源",
            //seller order list
            'seller_order_list': "卖家订单列表",
            //seller token detail
            'sellertokendetail': "卖家Token详情列表",
            'checkout': "去结算",
            //error
            'error_empty': "不能为空",
            'error_limit20':"限20位字符",
            'error_limit42':"限42位字母或数字",
            'error_password_not_match':"密码不一致",
            //header page
            'backup_keystore':"备份账户keystore",
            'logout':"登出",
            //keystroe modal
            'modal_title':"获取KeyStore,请妥善保存",
            'private_key':"私钥",
            'close':"关闭",
            "copy_keystore":"复制Keystore",
            "balance":"子链余额"
        },
        'en_US': {
            'main_title':"Master Of Data",
            'switch_language':"Switch Language",
            'placing_order':"Placing your order...",
            'placing_file':"Upload Ipfs your file...",
            'publish_product':"Publish your product...",
            'retriving_resource':"Retriving resource and transfer token belonger...",
            //message
            'copy_keystore_success':"Copy keystore success. Please paste manually",
            'order_success':"Place order success, you can view on order history",
            'cannot_purchase_own_product':"You cannot purchase your own product",
            'cannot_auth_product':"The user already owns the product and does not need to be authorized to him",
            'operation_success':"Success!Please refresh page after 10 seconds",
            'operation_fail':"Fail",
            'order_fail':"Fail to place order",
            'error_retirve_resource':"Cannot retrive resource",
            'error_server':"Exception: resource server error",
            "error_link_expired":"Link expired",
            'error_illegal_link':"Illegal link format",
            'publish_success':"Success! Result will be display on product list after 10 seconds",
            'password_error':"Password error",
            'login_fail_try_keystore':'Login fail, please try login with keyStore',
            'login_fail_checkInfo':'Login fail, please check account or password',
            'keystore_format_error':"Error: Please check keyStore format",
            'register_success':"Register success, your account is: ",
            'session_expired':"Not logged in or session expired",
            //login
            'login_title':"User Login",
            'login':"Login",
            "keystore_login":"keystore Login",
            "register":"Register",
            'account':"Account",
            'password':"Password",
            'confirm_password':"Confirm",
            //NAV     
            'navbar': "NavBar",
            'home': 'Home',
            'porduct': "Porduct",
            'seller': "Seller",
            'logs': "Logs",
            'subchain_explorer': "Subchain Explorer",
            //mainboard   
            'product_list': "Product List",
            'purchase_history': "Check purchase history",
            'product_id': "Product ID",
            'seller_address': "Seller Address",
            'Supplier': "Source",
            'product': "Product",
            'price': "Price",
            'abstract': "Abstract",
            'register_date': "Register Date",
            'quantity': "Quantity",
            'operation': "Operation",
            'buy': "Buy",
            'buy_free': "FreeBuy",
            'release_product': "Publish Product",
            'sale_history': "Check sale history",
            'purchase_link': "Data File",
            "product_status": "Product Status",
            'data_authorize': "Data Authorize",
            'authorize_address': "Authorize Address",
            'auth': "Authorize",
            'tips': "Tips",
            'auth_tips': "You can send an e-mail application to the merchant!",
            'buy_tips': "You have purchased this product and can use it on historical orders!",
            //home page
            'instruction': "Instruction",
            'data_flow_title':"Data Flow",
            'data_flow_content':"Master of Data（数据大师）是一个基于MOAC区块链和IPFS分布式存储的汽车数据Demo。此Demo主要实现汽车相关数据的上传，分发，浏览和使用，所有业务逻辑使用智能合约实现。",
            'data_framework_content':"MOAC母子链结构为本Demo提供链端支持。我们只需要实现业务逻辑便可在通用子链上部署和调试。",
            'data_use_content':"本Demo将数据分为三种使用类型，分别是免费数据，授权数据和购买数据。免费数据支持一次点击，立即使用；授权数据需要数据拥有者预授权，然后被授权账户才能使用；购买数据采用MOAC子链原生货币，支付费用后才能使用。此外，点击商品时采用实时ERC721生成，将每个用户的订单都生成一个ERC721通证。",
            'MOAC_blockchain_title':"MOAC Blockchain",
            'MOAC_blockchain_content':"The core funciton of Bigdata Trading Platform is build upon MOAC subchain multi-contract technique. The infrastructure of MOAC is the cluster of one 'mother chain' and many subchains. With sharding technique, each subchain runs upon mother chain as sub-blockchain. And the subchain mainly responsible for the management of smart contract. In terms of sharding, it's divide network to many shards, the overall system will remain high level security while we have enough node within each shard. Additionally, the sharding technique support security filter for parallel transactions to promote TPS (Transactio per Second). It's far beyond current blockchain solution.",
            //buyerorderlist
            'buyerorderlist': "Order List",
            'back': "Back",
            'orderNum': "Order#",
            'buyer_address': "Buyer Address",
            'time_place_order': "Time Place Order",
            'token_detail': "Token detail",
            'file_download': "File Download",
            //buyer token detail
            'buyertokendetail': "Buyer Token Detail List",
            'access_to_resources': "Access to resources",
            'token_belonger': "Token Belonger",
            'token_status': "Token Status",
            'unused': "Unused",
            'used': "Used",
            'settled': "Settled",
            'to_use':"To use",
            'publish_TX_hash':"Publish product Transaction Hash",
            'showup_product_TX_hash':"list or un-list product Transaction hash",
            'place_order_TX_hash':"Place order Transaction Hash",
            'erc721_hash':"erc721 Transaction Hash",
            'update_TX_status_hash':"Update order status Transaction Hash",
            //publish page
            'productNum': "Product Number",
            'submit': "Submit",
            'type': "Type",
            'source':"Source",
            //seller order list
            'seller_order_list': "Seller Order List",
            //seller token detail
            'sellertokendetail': "Seller Token Detail List",
            'checkout': "Checkout",
            //error
            'error_empty': "Cannot be empty",
            'error_limit20':"20 character limit",
            'error_limit42':"42 character limit",
            'error_password_not_match':"Password not match",
            //header page
            'backup_keystore':"Backup keystore",
            'logout':"Logout",
            //keystroe modal
            'modal_title':"Retrieve keystore, please backup",
            'private_key':"PrivateKey",
            'close':"Close",
            "copy_keystore":"Copy Keystore",
            "balance":"Micro Blance"
            	
        },
        
    });

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive.
***/

/* Setup Layout Part - Header */
BlocksApp.controller('HeaderController', ['$scope', '$location', function ($scope, $location) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header
    });

    $scope.form = {};
    $scope.searchQuery = function (s) {
        var search = s.toLowerCase();

        $scope.form.searchInput = "";
        $scope.form.searchForm.$setPristine();
        $scope.form.searchForm.$setUntouched();
        if (isAddress(search)) {
            $location.path("/addr/" + search);
        } else if (isTransaction(search)) {
            $location.path("/tx/" + search);
        } else if (!isNaN(search)) {
            $location.path("/block/" + search);
        } else {
            $scope.form.searchInput = search;
        }


    }
}]);

/* Search Bar */
BlocksApp.controller('PageHeadController', ['$scope', '$http', function ($scope, $http) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        console.log('PageHeadController loaded');
    });

    $scope.checkLogin = function () {
        //var userAddr = "0x6f366fef44bff173620fb56e8f394a999d1cc172";
        var userAddr = getCookie("verifyFlag");
        // if (userAddr == null) {
        //     alert("未登录或会话过期！");
        //     window.location.href = "http://" + window.location.host + "/home";
        // }
        return userAddr;
    }


    var userAddr = $scope.checkLogin();
    $scope.currentUser = userAddr;
    console.log('PageHeadController user', userAddr);

    
  //获取余额
	$scope.getTokenBalance = function (address) {
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
    

    // $scope.toggleNav = function () {
    //     console.log("click pagehead toggle");
    //     // $(".dropdownContent").slideToggle(200);
    //     $('.dropdownContent')
    //         .transition({animation:'drop'});
    // }

}]);

/* Setup Layout Part - Footer */
BlocksApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
BlocksApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("index");

    $stateProvider
        // Dashboard
	    .state('index', {
	        url: "/index",
	        templateUrl: "views/index.html",
	        data: { pageTitle: '', tabName: "Index" },
	        controller: "IndexController",
	        resolve: {
	            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
	                return $ocLazyLoad.load([{
	                    name: 'BlocksApp',
	                    insertBefore: '#ng_load_plugins_before',
	                    files: [
	                        '/js/controllers/IndexController.js',
	                        // '/js/controllers/PageHeadController.js',
	                        '/css/todo-2.min.css'
	                    ]
	                }]);
	            }]
	        }
	    })
        .state('home', {
            url: "/home",
            templateUrl: "views/home.html",
            data: { pageTitle: '', tabName: "Home" },
            controller: "HomeController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/js/controllers/HomeController.js',
                            // '/js/controllers/PageHeadController.js',
                            '/css/todo-2.min.css'
                        ]
                    }]);
                }]
            }
        })

        .state('mainBoard', {
            url: "/mainBoard",
            templateUrl: "views/mainBoard.html",
            data: { pageTitle: '', tabName: "Address" },
            controller: "MainBoardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/MainBoardController.js',
                            // '/js/controllers/PageHeadController.js',
                            '/plugins/datatables/datatables.min.css',
                            '/plugins/datatables/datatables.bootstrap.css',
                            '/plugins/datatables/datatables.all.min.js',
                            '/plugins/datatables/datatable.min.js'
                        ]
                    });
                }]
            }
        })
        .state('publish', {
            url: "/publish",
            templateUrl: "views/publish.html",
            data: { pageTitle: '', tabName: "Address" },
            controller: "PublishController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/PublishController.js'
                        ]
                    });
                }]
            }
        })

        .state('buyerOrderList', {
            url: "/buyerOrderList",
            templateUrl: "views/buyerOrderList.html",
            data: { pageTitle: '', tabName: "" },
            controller: "BuyerOrderListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/BuyerOrderListController.js'
                        ]
                    });
                }]
            }
        })
        .state('buyerOrderList2', {
            url: "/buyerOrderList/{pid}",
            templateUrl: "views/buyerOrderList.html",
            data: { pageTitle: '', tabName: "" },
            controller: "BuyerOrderListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/BuyerOrderListController.js'
                        ]
                    });
                }]
            }
        })
        .state('buyerTokenList', {
            url: "/buyerTokenList/{orderId}",
            templateUrl: "views/buyerTokenList.html",
            data: { pageTitle: '', tabName: "" },
            controller: "BuyerTokenListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/BuyerTokenListController.js'
                        ]
                    });
                }]
            }
        })
        .state('sellerOrderList', {
            url: "/sellerOrderList",
            templateUrl: "views/sellerOrderList.html",
            data: { pageTitle: '', tabName: "" },
            controller: "SellerOrderListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/SellerOrderListController.js'
                        ]
                    });
                }]
            }
        })
        .state('sellerTokenList', {
            url: "/sellerTokenList/{orderId}",
            templateUrl: "views/sellerTokenList.html",
            data: { pageTitle: '', tabName: "" },
            controller: "SellerTokenListController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/js/controllers/SellerTokenListController.js'
                        ]
                    });
                }]
            }
        })

        .state('getKey', {
            url: "/getKey",
            templateUrl: "views/getKey.html",
            data: { pageTitle: '', tabName: "Home" },
            controller: "GetKeyController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/js/controllers/GetKeyController.js',
                            '/css/todo-2.min.css'
                        ]
                    }]);
                }]
            }
        })
        .state('setParam', {
            url: "/setParam",
            templateUrl: "views/setParam.html",
            controller: "SetParamController",
            params: {
                "url": null, "params": null, "accessTokenKey": null, "accessTokenValue": null,
                "method": null, "buyer": null, "seller": null, "orderId": null, "tokenId": null
            },
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/js/controllers/SetParamController.js',
                            '/css/todo-2.min.css'
                        ]
                    }]);
                }]
            }
        })

        .state('tan', {
            url: "/tan",
            templateUrl: "views/tan.html",
            data: { pageTitle: '', tabName: "Home" },
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/js/controllers/TanController.js',
                            '/css/todo-2.min.css'
                        ]
                    }]);
                }]
            }
        })

        .state('err404', {
            url: "/err404/{thing}/{hash}",
            templateUrl: "views/err_404.html",
            data: { pageTitle: '404 Not Found.', tabName: "404" },
            controller: "ErrController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'BlocksApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/js/controllers/ErrController.js'
                        ]
                    });
                }]
            }
        })
}]);

BlocksApp.filter('timeDuration', function () {
    return function (timestamp) {
        return getDuration(timestamp).toString();
    };
})
    .filter('totalDifficulty', function () {
        return function (hashes) {
            return getDifficulty(hashes);
        };
    })
    .filter('teraHashes', function () {
        return function (hashes) {
            var result = hashes / Math.pow(1000, 4);
            return parseInt(result);
        }
    })

/* Init global settings and run the app */
BlocksApp.run(["$rootScope", "settings", "$state", function ($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
}]);