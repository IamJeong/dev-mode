const shim = require('fabric-shim');
const util = require('util');

const ABstore = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('========= ABstore Init =========');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    try {
      let admin = {
        userId: 'admin',
        password: 'root1234',
        balance: 0,
        username: 'admin'
      };
      await stub.putState("admin", Buffer.from(JSON.stringify(admin)));
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

    let userBytes = await stub.getState(userId);
    if (userBytes && userBytes.length > 0) {
      return shim.error('User already exists');
    }

    let user = {
      username: username,
      userId: userId,
      password: password,
      balance: 5000  // Initial points
    };

    await stub.putState(userId, Buffer.from(JSON.stringify(user)));
    return Buffer.from('Registration successful');
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

    let adminId = 'admin';
    let adminBytes = await stub.getState(adminId);
    if (!adminBytes || adminBytes.length === 0) {
      return shim.error('사용자를 찾을 수 없습니다.');
    }

    let userId = args[0];
    let amount = parseInt(args[1]);

    let userBytes = await stub.getState(userId);
    if (!userBytes || userBytes.length === 0) {
      return shim.error('사용자를 찾을 수 없습니다.');
    }

    let user = JSON.parse(userBytes.toString());
    user.balance += amount;

    await stub.putState(userId, Buffer.from(JSON.stringify(user)));
    return Buffer.from('성공');
  }

  async sendPoints(stub, args) {
    if (args.length != 3) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }

    let senderId = args[0];
    let receiverId = args[1];
    let amount = parseInt(args[2]);

    let senderBytes = await stub.getState(senderId);
    if (!senderBytes || senderBytes.length === 0) {
      return shim.error('사용자를 찾을 수 없습니다.');
    }

    let receiverBytes = await stub.getState(receiverId);
    if (!receiverBytes || receiverBytes.length === 0) {
      return shim.error('사용자를 찾을 수 없습니다.');
    }

    let sender = JSON.parse(senderBytes.toString());
    let receiver = JSON.parse(receiverBytes.toString());

    if (sender.balance < amount) {
      return shim.error('잔액이 부족합니다.');
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await stub.putState(senderId, Buffer.from(JSON.stringify(sender)));
    await stub.putState(receiverId, Buffer.from(JSON.stringify(receiver)));

    return Buffer.from('포인트 전송 성공');
  }

  async playGame(stub, args) {
    if (args.length != 3) {
      return shim.error('Incorrect number of arguments. Expecting 3');
    }

    let userId = args[0];
    let betAmount = parseInt(args[1]);
    let choice = args[2];

    let userBytes = await stub.getState(userId);
    if (!userBytes || userBytes.length === 0) {
      return shim.error('사용자를 찾을 수 없습니다.');
    }

    let user = JSON.parse(userBytes.toString());

    if (user.balance < betAmount) {
      return shim.error('잔액이 부족합니다.');
    }

    const randomValue = Math.floor(Math.random() * 100); 
    const result = randomValue % 2 === 0 ? '짝' : '홀';
    if (result === choice) {
      user.balance += betAmount - (betAmount / 10);
    } else {
      user.balance -= betAmount;
    }

    await stub.putState(userId, Buffer.from(JSON.stringify(user)));
    return Buffer.from(`게임완료 결과: ${result}`);
  }
};

shim.start(new ABstore());
