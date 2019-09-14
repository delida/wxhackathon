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

    
  function SmartContract() public {
    owner = msg.sender;
	ercAddr = address(0);
  }
  
  function setErcAddr(address _ercAddr) public {
    require(owner == msg.sender);
    
    ercAddr = _ercAddr;
  }


  
}