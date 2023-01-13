pragma solidity 0.8.7;

contract faucet {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    // This function takes an address as an input and checks if it's a contract or an EOA
    function checkAddress(address target) internal view returns (bool) {
        return bytes32(address(target).code) == bytes32(0x0);
    }

    

    // Modifier to check that the caller is the owner of
    // the contract.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function sendEth(address target) external onlyOwner{

        if(checkAddress(target) && address(this).balance > 50000000000000000){

            payable(target).transfer(50000000000000000);


        }else{
            revert("address is not a valid EOA or insufficient balance");
        }
    }


    function kill() external onlyOwner {
        selfdestruct(payable(owner));
    }

    fallback() external payable{}

    



}