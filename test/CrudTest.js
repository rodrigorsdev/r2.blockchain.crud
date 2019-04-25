const truffleAssert = require('truffle-assertions');
const Web3 = require('web3');

const Crud = artifacts.require('./Crud.sol');

contract('Crud', function (accounts) {

    const address0 = accounts[0];
    const address1 = accounts[1];

    let web3;
    let crud;

    beforeEach('setup contract for each test', async () => {
        web3 = new Web3('http://localhost:8545');
        crud = await Crud.new();
    });

    describe('user exists', function () {
        it('user exists', async () => {
            var expected = false;
            var result = await crud.userExists(address0);
            assert.equal(result, expected, 'user not exists');
        });
    });

    describe('insert user', function () {

        it('insert', async () => {
            var expected = 0;
            var result = await crud.insertUser(address1, 'email@r2dev.com', { from: address1 });
            console.log(result);
            console.log(result.tx);
            console.log(await web3.eth.getTransactionReceipt(result.tx));
            console.log(await web3.toUtf8(result));
            assert.equal(result.index, expected, 'user inserted');
        });

        it('user exists', async () => {
            var expected = true;
            var result = await crud.userExists(address1);
            assert.equal(result, expected, 'user exists');
        });

    });

});