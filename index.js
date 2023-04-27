const ethers = require("ethers");
const users = require("./users.json")
const token_abi = require("./ERC20.json")
const multicall_abi = require("./MULTICALL.json")

const rpcUrl = process.env.RPC_URL;
const usdc = process.env.USDC;
const multicall = process.env.MULTICALL;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(rpcUrl);

let wallet = new ethers.Wallet(privateKey,provider);
let token = new ethers.Contract( usdc , token_abi , wallet );
let multiCall = new ethers.Contract( multicall , multicall_abi , wallet );
let total = 0;
( async ()=>{

    let calls = [];
    const initialValue = 0;
    const sumWithInitial = users.reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue.amount),
        initialValue
        );
    
    console.log("sumWithInitial:",sumWithInitial);
    await token.approve(multicall,sumWithInitial)
    const encodedForMulticall = token.interface.encodeFunctionData("transferFrom",[wallet.address,multicall,sumWithInitial]);

    calls.push({
        target:usdc,
        callData:encodedForMulticall
    });

    for (let index = 0; index < users.length; index++) {
        const element = users[index];
        total += parseInt(element.amount);
        const encoded = token.interface.encodeFunctionData("transfer",[element.id,element.amount]);
        calls.push({
            target:usdc,
            callData:encoded
        });
        console.log(`[${index+1}]: Amount of ${ethers.formatUnits(element.amount,6)} USDC has been airdroped to ${element.id}`);
    }
    let response = await multiCall.aggregate(calls);
    await response.wait();

})();
