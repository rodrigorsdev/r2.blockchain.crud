const Crud = artifacts.require('../contracts/Crud');
const Assert = require('truffle-assertions');

contract('Crud contract', (accounts) => {
    let contractInstance;
    const ownerAddress = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    before(() => {
        web3.eth.defaultAccount = ownerAddress;
    });

    beforeEach(async () => {
        contractInstance = await Crud.new();
    });

    it('add should throw if name length is less than USER_NAME_MIN_LENGTH', async () => {
        const name = web3.utils.fromUtf8('us');
        const email = web3.utils.fromUtf8('user@domain.com');
        await Assert.reverts(
            contractInstance.add(name, email, { from: user1 }),
            'user name min length invalid');
    });

    it('add should throw if user already exist', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        await Assert.reverts(
            contractInstance.add(name, email, { from: user1 }),
            'user exists');
    });

    it('add should throw if user email already exist', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        await Assert.reverts(
            contractInstance.add(name, email, { from: user2 }),
            'email exists');
    });

    it('exists true', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });
        const resultExists = await contractInstance.exists(email);

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        assert.equal(resultExists, true, 'result user exists is wrong');
    });

    it('exists false', async () => {
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultExists = await contractInstance.exists(email);

        assert.equal(resultExists, false, 'result user exists is wrong');
    });

    it('getUserByEmail should throw if user not exists', async () => {
        const email = web3.utils.fromUtf8('user@domain.com');
        await Assert.reverts(
            contractInstance.getUserByEmail(email),
            'user not exists');
    });

    it('getUserByEmail success if user exists', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });
        const getResult = await contractInstance.getUserByEmail(email);

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        assert.equal(getResult, name, 'name is wrong');
    });

    it('getUsersLength success', async () => {
        const name1 = web3.utils.fromUtf8('user1');
        const email1 = web3.utils.fromUtf8('user1@domain.com');
        const name2 = web3.utils.fromUtf8('user2');
        const email2 = web3.utils.fromUtf8('user2@domain.com');

        const resultAdd1 = await contractInstance.add(name1, email1, { from: user1 });
        const resultUsersLength1 = await contractInstance.getUsersLength();
        const resultAdd2 = await contractInstance.add(name2, email2, { from: user2 });
        const resultUsersLength2 = await contractInstance.getUsersLength();

        Assert.eventEmitted(resultAdd1, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name1 && ev._email == email1
        });
        Assert.eventEmitted(resultAdd2, 'UserAdded', (ev) => {
            return ev._index == 2 && ev._name == name2 && ev._email == email2
        });
        assert.equal(resultUsersLength1, 2, 'users length is wrong');
        assert.equal(resultUsersLength2, 3, 'users length is wrong');
    });

    it('update should throw if is not owner', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        await Assert.reverts(
            contractInstance.update(name, email, { from: user2 }),
            'is not the owner');
    });

    it('update should throw if name length is less than USER_NAME_MIN_LENGTH', async () => {
        const name = web3.utils.fromUtf8('us');
        const email = web3.utils.fromUtf8('user@domain.com');
        await Assert.reverts(
            contractInstance.update(name, email, { from: user1 }),
            'user name min length invalid');
    });

    it('update should throw if user not exist', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        await Assert.reverts(
            contractInstance.update(name, email, { from: user1 }),
            'user not exists');
    });

    it('update success', async () => {
        const name = web3.utils.fromUtf8('user1');
        const email = web3.utils.fromUtf8('user1@domain.com');
        const changedName = web3.utils.fromUtf8('user2');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });
        const resultGetUserAdded = await contractInstance.getUserByEmail(email);

        const resultUpdate = await contractInstance.update(changedName, email, { from: user1 });
        const resultGetUserUpdated = await contractInstance.getUserByEmail(email);

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        Assert.eventEmitted(resultUpdate, 'UserUpdated', (ev) => {
            return ev._name == changedName && ev._email == email
        });
        assert.equal(resultGetUserAdded, name, 'user name is wrong');
        assert.equal(resultGetUserUpdated, changedName, 'users changed name is wrong');
    });

    it('remove should throw if is not owner', async () => {
        const name = web3.utils.fromUtf8('user');
        const email = web3.utils.fromUtf8('user@domain.com');

        const resultAdd = await contractInstance.add(name, email, { from: user1 });

        Assert.eventEmitted(resultAdd, 'UserAdded', (ev) => {
            return ev._index == 1 && ev._name == name && ev._email == email
        });
        await Assert.reverts(
            contractInstance.remove(email, { from: user2 }),
            'is not the owner');
    });

    it('remove should throw if user not exist', async () => {
        const email = web3.utils.fromUtf8('user@domain.com');

        await Assert.reverts(
            contractInstance.remove(email, { from: user1 }),
            'user not exists');
    });

    it('remove success', async () => {
        assert.equal(1, 2, 'TO DO');
    });
});