pragma solidity ^0.4.21;

contract addressBook {
    mapping(address => bytes) public addressBooks;
    
    function updateAddressBook(bytes IPFSHash) public {
        addressBooks[msg.sender] = IPFSHash;
    }


}
