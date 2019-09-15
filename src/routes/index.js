var moacSdk = require( 'moac-api' );
var NodeCache = require( "node-cache" );
var mongoose = require( 'mongoose' );
var http = require("http");
var https = require("https");

var inspect = require('util').inspect;
var async = require('async');

var Chain3 = require('chain3');
var config = require('../config');
module.exports = function(app){
  
  app.post('/login', login);
  app.post('/keyStoreLogin', keyStoreLogin);
  app.post('/register', register);
  app.post('/publish', publish);
  app.post('/getSellingProducts', getSellingProducts);
  app.post('/getAllMyProducts', getAllMyProducts);
  app.post('/updateProductStatus', updateProductStatus);
  app.post('/buyProduct', buyProduct);
  app.post('/getAccessToken', getAccessToken);
  
  app.post('/getResource', getResource);
  app.post('/getCheckResult', getCheckResult);
  
  app.post('/getBuyerOrderList', getBuyerOrderList);
  app.post('/getSellerOrderList', getSellerOrderList);
  app.post('/getTokenOwner', getTokenOwner);
  app.post('/getTokenBalance', getTokenBalance);
  

  
  app.post('/getKey', getKey);
  
}

var VnodeChain = moacSdk.vnodeChain;
var vc = new VnodeChain(config.vnodeAddress);

var MicroChain = moacSdk.microChain;
var mc = new MicroChain(config.vnodeAddress, config.monitorAddress, config.microChainAddress, config.dappBaseAddress, config.via);

var account = moacSdk.account;
const myCache = new NodeCache( {checkperiod: 86400} );

var dappAddr;
var erc721Addr;
mc.getDappAddrList().then((data) => {
	dappAddr = data[2];
	erc721Addr = data[1];
});

function getKey(req, res) {
	var address = req.body.address;
	myCache.get(address.toLowerCase(), function(err, accountInfo){
		if (accountInfo == null || accountInfo == undefined) {
			res.write("用户不存在"); 
		} else {
			//res.write("privateKey---" + accountInfo.privateKey + ", ----keyStore---" + accountInfo.keyStore);
			res.write(JSON.stringify(accountInfo));
		}
		 
		res.end();
	});
	
}

// 登录
function login (req, res) {
	var address = req.body.address;
	var password = req.body.password;
	var flag = "0";
	var isAdmin = "0";
	myCache.get(address.toLowerCase(), function(err, accountInfo){
		if (accountInfo == null || accountInfo == undefined) {  
			// 未注册
			flag = "2";
			
		} else {
			try {
				var loginRes = account.login(address, password, accountInfo.keyStore);
				if (loginRes != null && loginRes != undefined) {
					flag = "1";
					//判断是否管理员
					if(address==config.paltformAddr){
						isAdmin = "1";
					}
				}
			} catch (e) {
				// 密码错误
				if (e.message == "Key derivation failed - possibly wrong password") {
					flag = "0";
				} else {
					// 未知错误
					flag = "3";
				}
			}
		}
		
		res.write(JSON.stringify({'flag':flag,'admin':isAdmin})); 
		res.end();
	});
}

function keyStoreLogin (req, res) {
	var flag = "0";
	var isAdmin = "0";
	try {
		var address = "0x" + JSON.parse(req.body.keyStore).address;
	} catch (e) {
		flag = "4";
	}
	if (flag != "4") {
		var keyStore = req.body.keyStore;
		var password = req.body.password;
		
		var newAccount = {};
		try {
			var loginRes = account.login(address, password, keyStore);
			if (loginRes != null && loginRes != undefined) {
				flag = "1";
				
				newAccount.address = address;
				newAccount.privateKey = loginRes;
				newAccount.keyStore = keyStore;
				myCache.set(address.toLowerCase(), newAccount, function(err, success){
					console.log("地址小写，写入缓存成功");
				});
				//判断是否管理员
				if(address==config.paltformAddr){
					isAdmin = "1";
				}
			}
		} catch (e) {
			// 密码错误
			if (e.message == "Key derivation failed - possibly wrong password") {
				flag = "0";
			} else {
				// 未知错误
				flag = "3";
			}
		}
	}
	
	res.write(JSON.stringify({'flag':flag,'admin':isAdmin})); 
	res.end();
}

// 注册
function register (req, res) {
	var password = req.body.password;
	var newAccount = account.register(password)
	myCache.set(newAccount.address.toLowerCase(), newAccount, function(err, success){
		console.log("地址小写，写入缓存成功");
	});
	var result = JSON.stringify(newAccount);
	res.write(result); 
	res.end();
}

// 发布商品
function publish (req, res) {
	var _name = req.body.name;
	var _ctype = parseInt(req.body.type);
	var _provide = req.body.provide;
	var _price = parseInt(req.body.price);
	var _introduce = req.body.introduce;
	var _hash = req.body.hash;
	var _file = req.body.file_name;
	var userAddr = req.body.userAddr;
	
	console.log(userAddr);
	console.log(dappAddr);
	
	//accountInfo.privateKey;
	//var privateKey = config.privateKey;
	// 正式
	myCache.get(userAddr, function(err, accountInfo){
		if (accountInfo == undefined || accountInfo == null) {
			res.write("2"); 
			res.end();
		} else {
			mc.sendRawTransaction(userAddr, config.microChainAddress, 0, dappAddr, 
					"createProduct(string,string,uint256,string,string,uint256,string)", ["string","string","uint256","string","string","uint256","string"], 
					[_provide,_name,_price,_hash,_file,_ctype,_introduce], accountInfo.privateKey).then((txHash) => {
						console.log(txHash);
						res.write(txHash); 
						res.end();
			}).catch((e) => {
				console.lo
				res.write("0"); 
				res.end();
			})
		}
		
	});
	
	// 测试
//	mc.sendRawTransaction(userAddr, config.microChainAddress, 0, dappAddr, 
//			"createProduct(string,string,uint256,string,string)", ["string","string","uint","string","string"], 
//			[provide,name,price,url,introduce], config.privateKey).then((data1) => {
//				res.write("1"); 
//				res.end();
//	}).catch((e) => {
//		res.write("0"); 
//		res.end();
//	})
	
}

// 获取正在出售的商品列表
function getSellingProducts (req, res) {
	mc.callContract(dappAddr, ["getProducts", "0x0"]).then((data) => {
		res.write(data); 
		res.end();
	}).catch((e) => {
		console.log("获取在售商品列表失败：" + e);
		res.write("0"); 
		res.end();
	});
}

// 获取我发布的所有商品
function getAllMyProducts (req, res) {
	var userAddr = req.body.userAddr;
	mc.callContract(dappAddr, ["getProducts", userAddr, "0"]).then((data) => {
		console.log(data);
		res.write(data); 
		res.end();
	}).catch((e) => {
		console.log("获取我发布的商品列表失败：" + e);
		res.write("0"); 
		res.end();
	});
}

// 上架下架商品
function updateProductStatus (req, res) {
	var status = req.body.status;
	var productId = req.body.productId;
	var userAddr = req.body.userAddr;
	if (status == 0) {
		var operate = "downProduct";
	} else if (status == 1) {
		var operate = "putProduct";
	}
	
	myCache.get(userAddr, function(err, accountInfo){
		
		if (accountInfo == undefined || accountInfo == null) {
			res.write("2"); 
			res.end();
		} else {
			mc.sendRawTransaction(userAddr, config.microChainAddress, 0, dappAddr, 
					operate + "(uint256)", ["uint"], [productId], accountInfo.privateKey).then((data) => {
					console.log("产品id " + productId + " 执行上下架操作：" + data);
					res.write(data); 
					res.end();
				}).catch((e) => {
					res.write("0"); 
					res.end();
				});
		}
		
		
	});
	
//	mc.sendRawTransaction(userAddr, config.microChainAddress, 0, dappAddr, 
//			operate + "(uint256)", ["uint"], [productId], config.privateKey).then((data) => {
//			console.log("产品id " + productId + " 执行上下架操作：" + data);
//			res.write(data); 
//			res.end();
//		}).catch((e) => {
//			res.write("0"); 
//			res.end();
//		});
	
	
}

// 购买(创建订单，调用卖家接口，转账，更新订单状态)
function buyProduct (req, res) {
	var userAddr = req.body.userAddr;
	var pid = parseInt(req.body.pid);
	var price = parseInt(req.body.price);
	var buyer = req.body.buyer;
	price = mc.chain3.toSha(price, "mc");
	
	myCache.get(userAddr, function(err, accountInfo){
		// 创建订单
		mc.sendRawTransaction(userAddr, config.microChainAddress, price, dappAddr, 
				"createOrder(uint256,address)",["uint256","address"], [pid, buyer],
				accountInfo.privateKey).then((txHash) => {
					console.log("txHash---" + txHash);
					
					t = Date.now();  
					sleep(11000);
					
	
					mc.getTransactionReceiptByHash(txHash).then((receiptRes) => {
						if (receiptRes.failed == false) {
							console.log(receiptRes);
							res.write(txHash); 
							res.end();
						} else {
							res.write("0"); 
							res.end();
						}
					});
					
		}).catch((e) => {
			console.log(e);
			res.write("0"); 
			res.end();
		});
	
	});
	
}

// 验签
var getAccessToken = function (req, res) {
	var orderId = req.body.orderId;
	var tokenId = req.body.tokenId;
	var productNo = req.body.productNo;
	var buyer = req.body.buyer;
	var seller = req.body.seller;
	var url = req.body.url;
	var urlParam = getUrlParam(url);
	
	var params = {};
	
	myCache.get(buyer, function(err, accountInfo){
		
		if (accountInfo == undefined || accountInfo == null) {
			res.write("2"); 
			res.end();
		} else {
			params.message = tokenId + "&" + buyer + "&" + productNo;   // 明文
			params.sha3Message = vc.chain3.sha3(params.message);
			params.signedData = mc.signMcMessage(params.sha3Message, accountInfo.privateKey);  // 密文
			//params.signedData = mc.signMcMessage(params.message, accountInfo.privateKey);  // 密文
			console.log(params); 
			//commonRpcRequest(urlParam.ip, urlParam.port, urlParam.path, params).then((restfulData) => {
			sendPostRequest(urlParam.ip, urlParam.port, urlParam.path, null, urlParam.type, params).then((restfulData) => {
				if (restfulData == null || restfulData == undefined || restfulData == "fail") {
					res.write("0"); 
					res.end();
				}  else {
					if (restfulData.errorCode == 200) {
						
						
						var data = restfulData.data;
						if (data.params != null && data.params != undefined && 
								data.params != "" && data.params != {} && data.params != []) {
							// 带有可变参数
							console.log(restfulData.data);
							res.write(JSON.stringify(restfulData.data)); 
							res.end();
						} else {
							transferAndUpdateOrderStatus(buyer, seller, tokenId, orderId).then((txs) => {
								restfulData.data.txs = txs;
								console.log(restfulData.data);
								res.write(JSON.stringify(restfulData.data)); 
								res.end();
							});
						}
						
						
						
					} else {
						// 验签失败
						console.log("验签失败！-----" + restfulData.message);
						res.write("0"); 
						res.end();
					}
			}
			}).catch((e) => {
				console.log("卖家restful接口调用失败！");
				res.write("0"); 
				res.end();
			})
		}
		
		
	});
	
}

var getCheckResult = function (req, res) {
	var buyer = req.body.buyer;
	var seller = req.body.seller;
	var tokenId = req.body.tokenId;
	var orderId = req.body.orderId;
	transferAndUpdateOrderStatus(buyer, seller, tokenId, orderId).then((txs) => {
		res.write(txs); 
		res.end();
	})
	
}

var transferAndUpdateOrderStatus = function (buyer, seller, tokenId, orderId) {
	return new Promise ((resolve, reject) => {
		myCache.get(buyer, function(err, accountInfo){
			// 转账
			mc.sendRawTransaction(buyer, config.microChainAddress, 0, erc721Addr, "transferFrom(address,address,uint256)",
					["address","address","uint256"], [buyer, seller, tokenId], accountInfo.privateKey).then((data1) => {
						console.log("转账erc721----" + data1);
						
						t = Date.now();  
						sleep(3000);  // 确认nonce累加安全
						
						// 更新订单状态
						mc.sendRawTransaction(buyer, config.microChainAddress, 0, dappAddr, "updateOrderStatus(uint256,uint256,uint256)",
								["uint256","uint256","uint256"], [orderId, tokenId, 1], accountInfo.privateKey).then((data2) => {
							
							console.log("更新订单状态----" +data2);
							resolve(data1 + "&" + data2);
						}).catch((e) => {
							console.log("更新订单状态失败！");
						});
			}).catch((e) => {
				console.log("转账erc721失败！");
			});
		});
	});
	
}

//查询买家历史订单
var getBuyerOrderList = function(req, res) {
	var buyer = req.body.userAddr;
	var pageNum = req.body.pageNum;
	var pageSize = req.body.pageSize;
	//var buyer = "0xe7e52b94e9a82351302260ec39a300e9f00aee4c";//卖家账号
	var resResult = {};
	
	var data = ["getOrders", buyer,"1"];//合约方法
	mc.callContract(dappAddr, data).then((result) => {
		jsonObject = JSON.parse(result);
		resResult.orderData = jsonObject;
		resResult.count = jsonObject.length;
		res.write(JSON.stringify({"orderList": resResult}));
		res.end();
	}, (error) => { 
		console.log(error);
		resResult.orderData = {};
		resResult.count = 0;
		res.write(JSON.stringify({"orderList": resResult}));
		res.end();
	});
	
	
}
//查询卖家历史订单
var getSellerOrderList = function(req, res) {
	var seller = req.body.userAddr;
	var pageNum = req.body.pageNum;
	var pageSize = req.body.pageSize;
//	var seller = "0x6f366fef44bff173620fb56e8f394a999d1cc172";//卖家账号
	var resResult = {};
	
	var data = ["getOrders", seller,"2"];//合约方法
	mc.callContract(dappAddr, data).then((result) => {
		jsonObject = JSON.parse(result);
		resResult.orderData = jsonObject;
		resResult.count = jsonObject.length;
		res.write(JSON.stringify({"orderList": resResult}));
		res.end();
	}, (error) => { 
		resResult.orderData = {};
		resResult.count = 0;
		res.write(JSON.stringify({"orderList": resResult}));
		res.end();
	});
	
	
}
//查询Token所属人
var getTokenOwner = function(req, res) {
	var tokenid = req.body.tokenid;
	var resResult = {};
	tokenid =  parseInt(tokenid).toString(16);
	console.log(tokenid);
	var data = ["ownerOf",tokenid ];//合约方法
	mc.callContract(erc721Addr, data).then((result) => {
		console.log(result);
		result = result.replace(/\"/g, "");
		res.write(result);
		res.end();
	}, (error) => { 
		console.log("error:"+error);
		res.write("");
		res.end();
	});
	
	
}

//查询子链账户余额
var getTokenBalance = function(req, res) {
	var address = req.body.address;
	//var blance = vc.getBalance(address);
	mc.getBalance(address).then((result) => {
		result = result/1000000000000000000
		res.write(String(result));
		res.end();
	}, (error) => { 
		console.log("error:"+error);
		res.write("");
		res.end();
	});
}

// 获取资源

//var data = {"jsonrpc": "2.0", "id": 0, "method": method, "params": params};

var getResource = function (req, res) {
	
	try {
	var url = req.body.url.replace(/\s+/g, "");
	console.log("获取资源入参为：" + url);
	var requestUrl = url.split("&&")[0];
	var atParam = url.split("&&")[1];
	var accessTokenKey = atParam.split("&")[0].split("=")[1];
	var accessTokenValue = atParam.split("&")[1].split("=")[1];
	
	var method = atParam.split("&")[2].split("=")[1].toLowerCase();
	
	var urlParam = getUrlParam(requestUrl);
	var ip = urlParam.ip;
	var port = urlParam.port;
	var path = urlParam.path;
	var urlType = urlParam.type
	
	console.log("解析后的IP：" + ip);
	console.log("解析后的port：" + port);
	console.log("解析后的path：" + path);
	console.log("解析后的urlType：" + urlType);
	
	if (method == "get") {
		var headers = {};
		headers[accessTokenKey] = accessTokenValue;
		headers["Content-Type"] = "application/json";
		
		sendGetRequest(ip, port, path, headers, urlType).then((data) => {
			if (data == "fail") {
				// json返回错误
				res.write("0");
				res.end();
			} else if (data == "2"){
				// 获取不到资源值
				res.write("2");
				res.end();
			} else if (data.errorCode == 401001) { // token 过期
				res.write("3");
				res.end();
			} 
//			else if (data.errorCode != 200) { 
//				console.log("卖家api资源服务器异常：---" + JSON.stringify(data));
//				res.write("2");
//				res.end();
//			} 
			else {
				res.write(JSON.stringify(data));
				res.end();
			}
			
		});
	} else if (method == "post") {
		var headers = {
		        "Content-Type": 'application/json',
		    };
		headers[accessTokenKey] = accessTokenValue;
		
		var finalPath = path.split("?")[0];
		var paramsStr = path.split("?")[1];
		
		var params = {};
	
		// decodeURI("%5B1,2,3%5D")
		//ids=[1,2,3], age=22, name=1,2
		paramsStr.split("&").forEach(function(item) {
			console.log(decodeURI(item.split("=")[1]));
			if (decodeURI(item.split("=")[1]).indexOf("[") > -1) {
				params[item.split("=")[0]] = JSON.parse(decodeURI(item.split("=")[1]));
			} else {
				params[item.split("=")[0]] = decodeURI(item.split("=")[1]);
			}
			
		});
		console.log("post请求的header为：" + JSON.stringify(headers))
		console.log("post请求的body为：" + JSON.stringify(params));
		
		sendPostRequest(ip, port, finalPath, headers, urlType, params).then((data) => {
			if (data == "fail") {
				// json返回错误
				res.write("0");
				res.end();
			} else if (data == "2"){
				// 获取不到资源值
				res.write("2");
				res.end();
			} else if (data.errorCode == 401001) { // token 过期
				res.write("3");
				res.end();
			} 
//			else if (data.errorCode != 200) { 
//				console.log("卖家api资源服务器异常：---" + JSON.stringify(data));
//				res.write("2");
//				res.end();
//			}  
			else {
				res.write(JSON.stringify(data));
				res.end();
			}
			
		});
	}	
	
	} catch (e) {
		console.log("获取资源报错：" + e);
		res.write("4");
		res.end();
	}
	
}


//通用get请求（http, https）
var sendGetRequest = function(ip, port, path, headers, type) {
	
	return new Promise((resolve, reject) => {
			var opt = {
				host: ip,
			    port: port,
			    method: 'GET',
			    path: path,
			    headers: headers
			}
			var req = null;
			var rpcResult = '';
			var datas = '';
			
			var httpVal = null;
			if (type == "http") {
				httpVal = http;
			} else if (type == "https") {
				httpVal = https;
			}
			
			req = httpVal.request(opt, function(result) {
				result.on('data', function(data) {
					
					datas += data;  // 注意：返回json数据量大时，会截取分批返回 
					
			    }).on('end', function(){
			    	if (datas != undefined && datas != null) {
			    		try {
			    			rpcResult = JSON.parse(datas); 
					    	resolve(rpcResult);
				    	} catch (e) {
				    		console.log("get请求json资源解析失败：" + datas);
				    		resolve("fail");
				    	}
			    		
			    	} else {
			    		// 请求获取不到返回值
			    		console.log("服务端接口无资源返回！");
			    		resolve("2");
			    	}
			    	
			    })
			});
			
			req.on('error', function (e) {  
				// request请求失败
			    console.log('请求失败: ' + e.message); 
			    reject("0");
			});  
			req.end();
	})
	
}

// 通用post请求（http，https）  headers传null，则取默认
var sendPostRequest = function(ip, port, path, headers, type, params) {
	return new Promise ((resolve, reject) => {
		data = JSON.stringify(params);
		if (headers == null || headers == "") {
			headers = {
		        "Content-Type": 'application/json',
		        "Accept": 'application/json',
		        "Content-Length": data.length
		    }
		}
		var opt = {
		    host: ip,
		    port: port,
		    method: 'POST',
		    path: path,
		    headers: headers
//		    headers:{
//		        "Content-Type": 'application/json',
//		        "Accept": 'application/json',
//		        "Content-Length": data.length
//		    }
		}
		
		var req = null;
		var rpcResult = '';
		var datas = '';
		
		var httpVal = null;
		if (type == "http") {
			httpVal = http;
		} else if (type == "https") {
			httpVal = https;
		}
		
		req = httpVal.request(opt, function(result) {
			
			result.on('data',function(data) {
				datas += data;  // 注意：返回json数据量大时，会截取分批返回
		    }).on('end', function(){
		    	if (datas != undefined && datas != null) {
		    		try {
			    		rpcResult = JSON.parse(datas)
				    	resolve(rpcResult);
			    	} catch (e) {
			    		console.log(type + " post请求json资源解析失败：" + datas);
			    		resolve("fail");
			    	}
			    	
		    	} else {
		    		// 请求获取不到返回值
		    		console.log("服务端接口无资源返回！");
		    		resolve("2");
		    	}
		    	
		    });
		}).on('error', function(e) {
		    console.log("error: " + e.message);
		    reject(e);
		});

		// 发送请求(post请求需要写入参数)
		req.write(data);
		req.end();
	});
	
}

var commonRpcRequest = function (ip, port,path, params) {
	return new Promise(function(resolve, reject){
		
		data = JSON.stringify(params);
		var opt = {
		    host: ip,
		    port: port,
		    method: 'POST',
		    path: path,
		    headers:{
		        "Content-Type": 'application/json',
		        "Accept": 'application/json',
		        "Content-Length": data.length,
		        "Connection": 'keep-alive'
		    }
		}
		 
		var request = requestWithTimeout(opt, 4000, function(result) {
			var rpcResult = '';
			var datas = '';
			result.on('data', function(data) {
				try {
					datas += data;  // 注意：返回json数据量大时，会截取分批返回
				} catch(e) {
					console.log(e);
				} 
		    }).on('end', function(){
		    	rpcResult = JSON.parse(datas);
		    	resolve(rpcResult);
		    });
		}).on('error', function(e) {
			if (e.message == "socket hang up") {
				resolve("fail");
			} else {
				reject(e);
			}
		    console.log("error: " + e.message);
		});

		request.write(data);
		request.end();
		
	});
}

// 时间戳（ms）转日期格式
// 年月日-day   时分秒-time
function addZero(s) {  // 小于10，前边补0
    return s < 10 ? '0' + s: s;
}

function formatDate(now, type) { 
    var year=now.getFullYear(); 
    var month=now.getMonth()+1; 
    var day=now.getDate(); 
    var hour=now.getHours(); 
    var minute=now.getMinutes(); 
    var second=now.getSeconds(); 
    
    var flag = "";
    if (type == "day") {
    	flag =  year + "-" + addZero(month) + "-" + addZero(day);
    } else if (type == "time") {
    	flag =  year + "-" + addZero(month) + "-" + addZero(day) + " " + addZero(hour) + ":" + addZero(minute) + ":" + addZero(second); 
    }
    return flag;
} 

var sendRequest = function(ip, port, method, params) {
return new Promise(function(resolve, reject){
	
	var data = {"jsonrpc": "2.0", "id": 0, "method": method, "params": params};
	data = JSON.stringify(data);
	var opt = {
	    host: ip,
	    port: port,
	    method: 'POST',
	    path:'/rpc',
	    headers:{
	        "Content-Type": 'application/json',
	        "Accept": 'application/json',
	        "Content-Length": data.length,
	        "Connection": 'keep-alive'
	    }
	}
	 
	var request = requestWithTimeout(opt, 4000, function(result) {
		var rpcResult = '';
		var datas = '';
		result.on('data', function(data) {
			try {
				datas += data;  // 注意：返回json数据量大时，会截取分批返回
			} catch(e) {
				console.log(e);
			} 
	    }).on('end', function(){
	    	rpcResult = JSON.parse(datas).result; 
	    	resolve(rpcResult);
	    });
	}).on('error', function(e) {
		if (e.message == "socket hang up") {
			resolve("fail");
		} else {
			reject(e);
		}
	    console.log("error: " + e.message);
	});

	request.write(data);
	request.end();
	
});
	
};

// 支持ip:port, 域名类的url
// return type(http, https), ip, port, path
//function getUrlParam (url) {
//	var result = {};
//	var urlHead = "";
//	if (url.indexOf("http://") == 0) {
//		result.type = "http";
//		urlHead = "http://"
//	} else if (url.indexOf("https://") == 0) {
//		result.type = "https";
//		urlHead = "https://"
//	}
//	
//	var mainUrl = url.replace(urlHead, "");
//	if (mainUrl.indexOf(":") > -1) {
//		// 存在端口
//		result.ip = mainUrl.split(":")[0];
//		var paramArr = mainUrl.split(":")[1].split("/")
//		result.port = paramArr[0];
//		result.path = "/" + paramArr[1] + "/" + paramArr[2];
//	} else {
//		// 不存在端口
//		result.ip = mainUrl.split("/")[0];
//		result.port = 0;
//		result.path = mainUrl.replace(result.ip, "");
//	}
//	
//	return result;
//}

function getUrlParam (url) {
	var result = {};
	var urlHead = "";
	if (url.indexOf("http://") == 0) {
		result.type = "http";
		urlHead = "http://"
	} else if (url.indexOf("https://") == 0) {
		result.type = "https";
		urlHead = "https://"
	}
	
	var mainUrl = url.replace(urlHead, "");
	if (mainUrl.indexOf(":") > -1) {
		// 存在端口
		result.ip = mainUrl.split(":")[0];
		var paramArr = mainUrl.split(":")[1].split("/")
		result.port = paramArr[0];
		result.path = mainUrl.split(":")[1].replace(result.port, "").split("&&")[0];
	} else {
		// 不存在端口
		result.ip = mainUrl.split("/")[0];
		result.port = 0;
		result.path = mainUrl.replace(result.ip, "");
	}
	
	return result;
}

var compare = function (obj1, obj2) {
	var val1 = obj1.timestamp;
	var val2 = obj2.timestamp;
    if (val1 < val2) {
        return 1;
    } else if (val1 > val2) {
        return -1;
    } else {
        return 0;
    }            
} 

var t = Date.now();  
function sleep(d){  
    while(Date.now() - t <= d);  
} 

// 带超时设置的request
function requestWithTimeout(options,timeout,callback){
    var timeoutEventId,
        req=http.request(options,function(res){
            
            res.on('end',function(){
                clearTimeout(timeoutEventId);
                console.log('response end...');
            });
            
            res.on('close',function(){
                clearTimeout(timeoutEventId);
                console.log('response close...');
            });
            
            res.on('abort',function(){
                console.log('abort...');
            });
            
            callback(res);
        });
        
    req.on('timeout',function(e){
        if(req.res){
            req.res('abort');
        }
        req.abort();
    });
    
    
    timeoutEventId=setTimeout(function(){
        req.emit('timeout',{message:'have been timeout...'});
    },timeout);
    
    return req;
}
