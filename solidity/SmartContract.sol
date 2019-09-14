pragma solidity ^0.4.19;
pragma experimental ABIEncoderV2;

contract TestCoin {
    function createToken(address _seller, string _name, uint _price, string _hash, string _file, uint _ctype, address _buyer, uint _otime) public returns (uint);
}

contract SmartContract {
  
  struct ProductInfo {
    uint pid;
    string provide;
    address seller;
    string name;
    uint price;
    string hash;
	string file;
	uint ctype;
	string introduce;
	bool shelf;
  }
    
  struct OrderInfo {
    uint oid;
    uint pid;
    string provide;
    address seller;
    string name;
    uint price;
    string hash; 
	string file;
	uint ctype;
    string introduce;
    uint	tokenid;
    address buyer;
    uint otime;
  }
    
	
  address public owner;
  address public ercAddr;

  mapping (uint => ProductInfo) internal products;
  uint[] internal allPids;
  mapping (address => uint[]) internal ownedPids;

    
  function SmartContract() public {
    owner = msg.sender;
	ercAddr = address(0);
  }
  
  function setErcAddr(address _ercAddr) public {
    require(owner == msg.sender);
    
    ercAddr = _ercAddr;
  }
  
  function createProduct(string _provide, string _name, uint _price, string _hash, string _file, uint _ctype, string _introduce) public returns (uint) {
  
	// ctype 1: public  2: approve  3: buy
  
    uint newPid = allPids.length;
    allPids.push(newPid);
    ProductInfo memory pt = ProductInfo({
      pid: newPid,
      provide: _provide,
      seller: msg.sender,
      name: _name,
      price: _price,
      hash: _hash,
	  file: _file,
      ctype: _ctype,
	  introduce: _introduce,
	  shelf: true
    });
    products[newPid] = pt;
    ownedPids[msg.sender].push(newPid);
    return newPid;
  }
    
  function updateProduct(uint _pid, string _provide, string _name, uint _price, string _hash, string _file, uint _ctype, string _introduce) public {
    ProductInfo memory pt = products[_pid];
    require(pt.seller == msg.sender);
  
    if (0 != bytes(_provide).length) {
      pt.provide = _provide;
    }
      
    if (0 != bytes(_name).length) {
      pt.name = _name;
    }
      
    if (0 != _price) {
      pt.price = _price;
    }
      
    if (0 != bytes(_hash).length) {
      pt.hash = _hash;
    }
	
	if (0 != bytes(_file).length) {
      pt.file = _file;
    }
	
	if (0 != _ctype) {
      pt.ctype = _ctype;
    }
      
    if (0 != bytes(_introduce).length) {
      pt.introduce = _introduce;
    }
    products[_pid] = pt;
  }
  
  function downProduct(uint _pid) public {
	require(msg.sender == owner);
	
    ProductInfo memory pt = products[_pid];
	pt.shelf = false;
    products[_pid] = pt;
  }
    
    
  function getProducts(address _addr) public view returns (ProductInfo[]) {
    uint i;
	uint j;
    ProductInfo[] memory pts;
    if (_addr == address(0)) {
		for (i = 0; i < allPids.length; i++) {
          if (products[allPids[i]].shelf == true) {
            j++;
          }
        }
        pts = new ProductInfo[](j);
        j = 0;
        for (i = 0; i < allPids.length; i++) {
          if (products[allPids[i]].shelf == true) {
            pts[j] = products[allPids[i]];
            j++;
          }
        }
    } else {
		for (i = 0; i < ownedPids[_addr].length; i++) {
          if (products[ownedPids[_addr][i]].shelf == true) {
            j++;
          }
        }
        pts = new ProductInfo[](j);
        j = 0;
        for (i = 0; i < ownedPids[_addr].length; i++) {
          if (products[ownedPids[_addr][i]].shelf == true) {
            pts[j] = products[ownedPids[_addr][i]];
            j++;
          }
        }
    }
    return pts;
  }


  
}