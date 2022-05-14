const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface,bytecode} = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  accounts = await new web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data : bytecode,arguments:[2]}).send({from : accounts[0], gas : '1000000'});
});

describe('Lottery Contract', () => {
  it('Deploys a Contract', () => {
    assert.ok(lottery.options.address);
  })

  it('attempting to enter', async () => {
    await lottery.methods.EnterLottery().send({
      from : accounts[0],
      value : web3.utils.toWei('0.1','ether')
    })

    const players = await lottery.methods.getPlayers().call({
      from : accounts[0]
    })

    assert.equal(accounts[0],players[0]);
    assert.equal(1,players.length);

  })

  it('attempting to enter multiple accounts', async () => {
    await lottery.methods.EnterLottery().send({
      from : accounts[0],
      value : web3.utils.toWei('0.1','ether')
    })
    await lottery.methods.EnterLottery().send({
      from : accounts[1],
      value : web3.utils.toWei('0.1','ether')
    })
    await lottery.methods.EnterLottery().send({
      from : accounts[2],
      value : web3.utils.toWei('0.1','ether')
    })

    const players = await lottery.methods.getPlayers().call({
      from : accounts[0]
    })

    assert.equal(accounts[0],players[0]);
    assert.equal(accounts[1],players[1]);
    assert.equal(accounts[2],players[2]);
    assert.equal(3,players.length);

  })

  it('throws an error', async () => {
    try {
      await lottery.methods.EnterLottery().send({
        from : accounts[0],
        value : 0
      })
      assert(false);
    } catch (err) {
      assert(err);
    }

  })
})
