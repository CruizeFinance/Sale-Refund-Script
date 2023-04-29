const ethers = require("ethers");
const users = require("./users.json")
const token_abi = require("./ERC20.json")
const multicall_abi = require("./MULTICALL.json")
require('dotenv').config();
const fs = require("fs")

const rpcUrl = process.env.RPC_URL;
const usdc = process.env.USDC;
const multicall = process.env.MULTICALL;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(rpcUrl);

let wallet = new ethers.Wallet(privateKey,provider);
let token = new ethers.Contract( usdc , token_abi , wallet );
let multiCall = new ethers.Contract( multicall , multicall_abi , wallet );
let total = 0;
const priceOfCruize = 50000; // 0.05 * 10^6

( async ()=>{

    let transactions = [];
    
    for (let index = 0; index < users.length; index++) {
        const element = users[index];
        total += parseInt(element.amount);
        const rewardsInUSD = parseInt(element.amount) * 0.1;
        const rewards = ethers.parseUnits((rewardsInUSD / priceOfCruize).toFixed(18),18);
        transactions.push(
            {
                "to": "0x1f5229F1e1B96ca6189A7a0BFb04249757977bB2",
                "value": "0",
                "data": null,
                "contractMethod": {
                  "inputs": [
                    { "name": "_to", "type": "address" },
                    { "name": "_value", "type": "uint256" }
                  ],
                  "name": "transfer",
                  "payable": false
                },
                "contractInputsValues": {
                  "_to": element.id,
                  "_value": rewards.toString()
                }
              }
        )

        var json = JSON.stringify(transactions);
        fs.writeFile('tx.json', json,  function(err) {
            if (err) throw err;
            console.log('complete');
            });


    }
})();
