const shim = require('fabric-shim');
const util = require('util');

const ABstore = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= ABstore Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    try {
      await stub.putState("admin", Buffer.from("0"));
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async query(stub, args) {
    if (args.length != 1) {
      return shim.error('Incorrect number of arguments. Expecting 1');
    }

    let userId = args[0];

    let userBytes = await stub.getState(userId);
    if (!userBytes || userBytes.length === 0) {
      return shim.error('User not found');
    }

    let user = JSON.parse(userBytes.toString());

    let jsonResp = {
      userId: user.userId,
      username: user.username,
      balance: user.balance
    };

    console.info('Query Response:');
    console.info(jsonResp);
    return Buffer.from(JSON.stringify(jsonResp));
  }

  async registerUser(stub, args) {
    if (args.length != 4) {
      return shim.error('Incorrect number of arguments. Expecting 4');
    }

    let username = args[0];
    let userId = args[1];
    let password = args[2];
    let confirmPassword = args[3];

    if (password !== confirmPassword) {
      return shim.error('Password and confirmation password do not match');
    }

    let user = {
      username: username,
      userId: userId,
      password: password,
      balance: 1000  // Initial points
    };

    await stub.putState(userId, Buffer.from(JSON.stringify(user)));
  }

  async loginUser(stub, args) {
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    let userId = args[0];
    let password = args[1];

    let userBytes = await stub.getState(userId);
    if (!userBytes || userBytes.length === 0) {
      return shim.error('User not found');
    }

    let user = JSON.parse(userBytes.toString());
    if (user.password !== password) {
      return shim.error('Invalid password');
    }

    return Buffer.from('Login successful');
  }

  async rechargePoints(stub, args) {
    if (args.length != 2) {
      return shim.error('Incorrect number of arguments. Expecting 2');
    }

    let userId = args[0];
    let amount = parseInt(args[1]);

    let userBytes = await stub.getState(userId);
    if (!userBytes || userBytes.length === 0) {
      return shim.error('User not found');
    }

    let user = JSON.parse(userBytes.toString());
    user.balance += amount;

    await stub.putState(userId, Buffer.from(JSON.stringify(user)));
    return Buffer.from('Points recharged successfully');
  }
};

shim.start(new ABstore());
