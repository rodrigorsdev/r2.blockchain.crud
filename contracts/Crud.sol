pragma solidity ^0.5.0;

contract Crud {

    struct User {
        string email;
        uint index;
    }

    mapping(address => User) private users;

    address[] private userIndex;

    function userExists(address userAddress) public view returns(bool exists) {
        if(userIndex.length == 0) {
            return false;
        }

        return(userIndex[users[userAddress].index] == userAddress);
    }

    function insertUser(address userAddress, string memory email) public returns (uint index) {
        require(!userExists(userAddress), 'user exists');
        users[userAddress].email = email;
        users[userAddress].index = userIndex.push(userAddress) -1;
        return userIndex.length -1;
    }

    function getUser(address userAddress) public view returns(string memory email, uint index) {
        require (userExists(userAddress), "user not exists");
        return (users[userAddress].email, users[userAddress].index);
    }

    function getUserCount() public view returns (uint count) {
        return userIndex.length;
    }

    function updateUserEmail(address userAddress, string memory email) public returns(bool success){
        require (userExists(userAddress), "user not exists");
        users[userAddress].email = email;
        return true;
    }

    function deleteUser(address userAddress) public returns (uint index){
        require (userExists(userAddress), "user not exists");
        uint rowToDelete = users[userAddress].index;
        address keyToMove = userIndex[userIndex.length-1];
        userIndex[rowToDelete] = keyToMove;
        users[keyToMove].index = rowToDelete;
        userIndex.length--;
        return rowToDelete;
    }
}