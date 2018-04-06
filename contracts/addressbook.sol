pragma solidity ^0.4.21;

contract addressBook {
    mapping(address => bytes32) public addressBooks;

    function updateAddressBook(bytes32 IPFSHash) public {
        addressBooks[msg.sender] = IPFSHash;
    }


}
