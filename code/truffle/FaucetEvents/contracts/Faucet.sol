// Version of Solidity compiler this program was written for
pragma solidity ^0.4.22;

contract owned {
	address owner;
	// Contract constructor: set owner
	constructor() {
		owner = msg.sender;
	}
	// Access control modifier
	modifier onlyOwner {
	    require(msg.sender == owner, "Only the contract owner can call this function");
	    _;
	}
}

contract mortal is owned {
	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}
}

contract Faucet is mortal {
	event Withdrawal(address indexed to, uint amount);
	event Deposit(address indexed from, uint amount);

    // Give out ether to anyone who asks
    function withdraw(uint withdraw_amount) public {
        // Limit withdrawal amount
		require(withdraw_amount <= 0.1 ether);
		require(this.balance >= withdraw_amount,
			"Insufficient balance in faucet for withdrawal request");
        // Send the amount to the address that requested it
        msg.sender.transfer(withdraw_amount);
		emit Withdrawal(msg.sender, withdraw_amount);
    }
    // Accept any incoming amount
    function () external payable {
		emit Deposit(msg.sender, msg.value);
	}
}
