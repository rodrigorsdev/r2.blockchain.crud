pragma solidity ^0.5.7;

contract Crud {

    address payable public contractOwner;

    uint constant USER_NAME_MIN_LENGTH = 3;

    struct User {
        bytes name;
        bytes email;
    }

    User[] users;
    mapping(address => uint) private userAddressMap;
    mapping(bytes => uint) private userEmailMap;

    constructor () public{
        contractOwner = msg.sender;
        users.push(User('', ''));
    }

    function kill() external {
        require(msg.sender == contractOwner, "only the contract owner can kill this contract");
        selfdestruct(contractOwner);
    }

    modifier isUserNameMinLengthValid(
        bytes memory _name
    )
    {
        require(
            _name.length >= USER_NAME_MIN_LENGTH,
            'user name min length invalid'
        );
        _;
    }

    modifier userNotExists()
    {
        require(
            userAddressMap[msg.sender] == 0,
            'user exists'
        );
        _;
    }

    modifier emailNotExists(
        bytes memory _email
    )
    {
        require(
            userEmailMap[_email] == 0,
            'email exists'
        );
        _;
    }

    modifier userExists(
        bytes memory _email
    )
    {
        require(
            userEmailMap[_email] != 0,
            'user not exists'
        );
        _;
    }

    modifier isOwner(bytes memory _email)
    {
        uint indexEmail = userEmailMap[_email];
        uint indexOwner = userAddressMap[msg.sender];
        require(
            indexEmail == indexOwner,
            'is not the owner'
        );
        _;
    }

    event UserAdded(
        uint _index,
        bytes _name,
        bytes _email
    );

    event UserUpdated(
        bytes _name,
        bytes _email
    );

    function add(
        bytes memory _name,
        bytes memory _email
    ) public
        isUserNameMinLengthValid(_name)
        userNotExists()
        emailNotExists(_email)
      payable
    {
        users.push(User(_name, _email));
        uint index = users.length - 1;
        userAddressMap[msg.sender] = index;
        userEmailMap[_email] = index;

        emit UserAdded(index, _name, _email);
    }

    function exists(
        bytes memory _email
    ) public view returns(bool)
    {
        return userEmailMap[_email] != 0;
    }

    function getUserByEmail(
        bytes memory _email
    ) public view
        userExists(_email)
      returns(bytes memory)
    {
        return users[userEmailMap[_email]].name;
    }

    function getUsersLength() public view returns(uint)
    {
        return users.length;
    }

    function update(
        bytes memory _name,
        bytes memory _email
    ) public
        isOwner(_email)
        isUserNameMinLengthValid(_name)
        userExists(_email)
      payable
    {
        users[userEmailMap[_email]].name = _name;
        emit UserUpdated(_name, _email);
    }

    function remove(
        bytes memory _email
    ) public
        isOwner(_email)
        userExists(_email)
      payable
    {
        uint indexToRemove = userEmailMap[_email];
        User memory user = users[users.length - 1];
        users[indexToRemove] = user;
        userEmailMap[user.email] = indexToRemove;
        ///TO DO
        users.length--;

    }
}