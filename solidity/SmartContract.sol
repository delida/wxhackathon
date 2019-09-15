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
    
  uint public penaltyBond = 10 ** 18; // 1 Moac penalty
  address public owner;
  address public ercAddr;
    
  mapping (uint => ProductInfo) internal products;
  uint[] internal allPids;
  mapping (address => uint[]) internal ownedPids;

  mapping (uint => OrderInfo) internal orders;
  uint[] internal allOids;
  mapping (address => uint[]) internal ownedBuyOids;
  mapping (address => uint[]) internal ownedSellOids;
  
  
     
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

  function createOrder(uint _pid, address _buyer) public payable returns (uint, uint) {  
    require(ercAddr != address(0));
    
    ProductInfo memory pt = products[_pid];
    uint tid;
    TestCoin erc721 = TestCoin(ercAddr);
	
	// ctype 1: public  2: approve  3: buy
	
	if (pt.ctype == 1) {
		// public for all    check ctype to call method with owner
		tid = erc721.createToken(pt.seller, pt.name, pt.price, pt.hash, pt.file, pt.ctype, _buyer, now);
	}else if (pt.ctype == 2) {
		// approve to _buyer
		require(msg.sender == owner);
		tid = erc721.createToken(pt.seller, pt.name, pt.price, pt.hash, pt.file, pt.ctype, _buyer, now);
	}else if (pt.ctype == 3) {
		// buy by _buyer
		require(msg.value == pt.price * penaltyBond);
		//require(_buyer.balance >= pt.price * penaltyBond);
		
		tid = erc721.createToken(pt.seller, pt.name, pt.price, pt.hash, pt.file, pt.ctype, _buyer, now);
	}else{
		return(0, pt.ctype);
	}
    
    uint newOid = allOids.length;
    allOids.push(newOid);
    OrderInfo memory od = OrderInfo({
      oid: newOid,
      pid: _pid,
      provide: pt.provide,
      seller: pt.seller,
      name: pt.name,
      price: pt.price,
      hash: pt.hash,
	  file: pt.file,
	  ctype: pt.ctype,
      introduce: pt.introduce,
      tokenid: tid,
      buyer: _buyer,
      otime: now
    });
    orders[newOid] = od;
    ownedBuyOids[_buyer].push(newOid);
    ownedSellOids[pt.seller].push(newOid);
    return (newOid, tid);
  }
  
  function getOrderByTokenid(uint _tokenid) public view returns (OrderInfo) {
    uint i;
    for (i = 0; i < allOids.length; i++) {
        if (orders[allOids[i]].tokenid == _tokenid) {
          return orders[allOids[i]];
        }
      
    }
  }
  
  
  function getOrders(address _addr, uint _type) public view returns (OrderInfo[]) {
    uint i;
    OrderInfo[] memory ods;
    if (_type == 0) {
      ods = new OrderInfo[](allOids.length);
      for (i = 0; i < allOids.length; i++) {
        ods[i] = orders[allOids[i]];
      }
    } else if (_type == 1) {
      ods = new OrderInfo[](ownedBuyOids[_addr].length);
      for (i = 0; i < ownedBuyOids[_addr].length; i++) {
        ods[i] = orders[ownedBuyOids[_addr][i]];
      }
    } else if (_type == 2) {
      ods = new OrderInfo[](ownedSellOids[_addr].length);
      for (i = 0; i < ownedSellOids[_addr].length; i++) {
        ods[i] = orders[ownedSellOids[_addr][i]];
      }
    }
    return ods;
  }
  

  
}