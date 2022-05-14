// const path = require('path');
// const fs = require('fs');
// const solc = require('solc');
//
// const lotteryPath = path.resolve(__dirname,'contracts','Lottery.sol');
// const source = fs.readFileSync(lotteryPath,'utf8');
//
// module.exports = solc.compile(source,1).contracts[':Lottery'];

function compileContract() {
    let LotterySOl = fs.readFileSync('./contracts/Lottery.sol' , 'utf8')
    let complierInput = {
        language: 'Solidity',
        sources:
        {
            'Lottery.sol':
            {
                content: LotterySOl
            }
        },
        settings:
        {
            optimizer:
            {
                enabled: true
            },
            outputSelection:
            {
                '*':{
                    '*':['*']
                }
            }
        }
    };
    console.log('compiling contract');
        let compiledContract = JSON.parse(solc.compile(JSON.stringify(complierInput)));
        console.log('Contract Compiled');
        for (let contractName in compiledContract.contracts['Lottery.sol']) {
            console.log(contractName , compiledContract.contracts['Lottery.sol'][contractName].abi);
            let abi = compiledContract.contracts['Lottery.sol'][contractName].abi;
            fs.writeFileSync(`./contracts/bin/${contractName}_abi.json` , JSON.stringify(abi));
            return compiledContract.contracts['Lottery.sol'][contractName];
        }
    }
