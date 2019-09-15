#!/usr/bin/env node

require( './db' );

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('./config');

var multer  = require('multer');
var fs = require('fs');
var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);
    }  
};
var uploadFolder = './upload/';
createFolder(uploadFolder);
// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname));  
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

//ipfs
var ipfsClient = require('ipfs-http-client')
var ipfs = ipfsClient(config.localIpfsIp, config.localIpfsPort, { protocol: 'http' });

var app = express();
app.set('port', process.env.PORT || 3001);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// app libraries
global.__lib = __dirname + '/lib/';


// client

app.get('/', function(req, res) {
  res.render('index');
});

//单图上传
app.post('/uploadFile', upload.single('file'), function(req, res, next){
	console.info("---------------------------------------------");
	var file = req.file;
	ipfsUploadFile(file.path).then((data) => {
		console.log("ipfs result: "+data);
		if (data == 0) {//上传ipfs失败
			res.end(JSON.stringify({ret_code: '1',ret_msg:'文件上传至IPFS节点失败！'})); 
		} else {
			res.end(JSON.stringify({ret_code: '0',ret_msg:'文件上传至IPFS节点成功！', hash: data, filename: file.filename})); 
		}
	})
});
//ipfs文件下载
app.post('/downloadFile',function(req,res){
	var fileIpfsHash = req.body.hash;
	var type = req.body.type;
	var filename = req.body.filename;
	console.log(fileIpfsHash);
	ipfs.cat("/ipfs/" + fileIpfsHash, function(err, file) {
	   if (err) {
		  console.info("下载时中心化ipfs cat拉取文件失败：" + err);
		  res.end(JSON.stringify({code: '1', success: false, data: null, message: "local ipfs cat fail!"})); 
	   } else {
		   console.log(file);
          res.writeHead(200,{  
              'Content-Type': 'application/octet-stream', // 告诉浏览器这是一个二进制文件
              'Content-Disposition': 'attachment; filename=' + type+'-'+filename, // 告诉浏览器这是一个需要下载的文件
          });  
          res.write(file)
          res.end(JSON.stringify({code: 200, success: true, data: file, message: ""})); 
	  }
   });
})


//ipfs同步
function ipfsUploadFile (path) {
	console.info("---------------------------------------------");
	console.info("同步至local ipfs开始");
	return new Promise ((resolve) => {
		let ipfsId
	    console.info("local ipfs path: " + path);
	    fs.readFile(path, (err, data) => {
	    	ipfs.add(data
	    			//{progress: (prog) => console.log(`received: ${prog}`)}
	    	).then((response) => {
	        	
	    		ipfsId = response[0].hash;
	    		console.info("local ipfs同步成功");
		        console.info(path.replace("upload/", "") + "----hash:" + ipfsId);
		        
	          // 删除文件
	          fs.unlinkSync(path);
	          
	          console.info("中心化文件删除成功");
	          resolve(ipfsId);
	          
	        }).catch((err) => {
	          console.error("ipfs同步异常：" + err)
	          resolve(0);
	        })
	    })
	});
    
}

require('./routes')(app);

// let angular catch them
app.use(function(req, res) {
  res.render('index');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var http = require('http').Server(app);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
