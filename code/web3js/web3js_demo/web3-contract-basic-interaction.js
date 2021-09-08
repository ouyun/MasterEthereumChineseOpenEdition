#!/usr/bin/env node

/**
 * @author Francisco Javier Rojas García <fjrojasgarcia@gmail.com>
 */

// Take a closer look at the web3 1.0 documentation for calling methods (it's very different from the 0.2x API).
// https://stackoverflow.com/questions/48547268/smart-contract-method-is-not-a-function-in-web3

console.log('Mastering Ethereum - web3.js basic interactions')
console.log('Author: Francisco Javier Rojas García - fjrojasgarcia@gmail.com')
console.log('Revisor: Ou Yun - ouyangowen@gmail.com')

const optionDefinitions = [
  { name: 'localRPC', alias: 'l', type: Boolean },
  { name: 'infuraFileToken', alias: 'i', type: String, defaultOption: true },
  { name: 'etherscanFileToken', alias: 'e', type: String, defaultOption: false }
]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions)

var Web3 = require('web3');
var fs = require('fs')

if (options.infuraFileToken && !options.localRPC) {
  console.log(options.infuraFileToken);

  // Loading an Infura Token from a file
  var infura_token = fs.readFileSync(options.infuraFileToken, 'utf8');

  // Show your Infura token
  console.log(infura_token);

  // Prepare your Infura host url
  var infura_host = `https://kovan.infura.io/v3/${infura_token}`

} else {
  console.log('Not argument found for infura token');

  // Prepare your Infura host url
  var infura_host = "https://kovan.infura.io/v3"

}

// Show your Infura host url for your web3 connection
console.log(infura_host);

if (options.etherscanFileToken) {
  console.log(options.etherscanFileToken);

  // Loading an Etherscan Token from a file
  var etherscan_token = fs.readFileSync(options.etherscanFileToken, 'utf8');

  // Show your Etherscan token
  console.log(etherscan_token);
} else {
  console.log('Not argument found for etherscan token');
}

// Instantiate web3 provider
var web3 = new Web3(infura_host);

// Let's do some basic interactions at web3 level
// Let's see the Protocol Version
web3.eth.getProtocolVersion().then(function(protocolVersion) {
      console.log(`Protocol Version: ${protocolVersion}`);
  })

// Now I'm curious about the current gas price
web3.eth.getGasPrice().then(function(gasPrice) {
      console.log(`Gas Price: ${gasPrice}`);
  })

// And, Whats the last mined block in my chain?
web3.eth.getBlockNumber().then(function(blockNumber) {
      console.log(`Block Number: ${blockNumber}`);
  })

// Now let's dive into some basics actions with a contract
// We will use the contract at;
// https://kovan.etherscan.io/address/0xd0a1e359811322d97991e03f863a0c30c2cf029c#code

// First things first, let's initialize our contract address
var our_contract_address = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";

// Let's see its balance
web3.eth.getBalance(our_contract_address).then(function(balance) {
      console.log(`Balance of ${our_contract_address}: ${balance}`);
})

// Now let's see its byte code
web3.eth.getCode(our_contract_address).then(function(code) {
      console.log("Contract code: ----------------------------------------------\n");
      console.log(code);
      console.log("-------------------------------------------------------------\n");
})

// Let's initialize your contract url in Etherescan for Kovan chain
// oijen: Right now, querying from etherscan.io is only provided throught api key token which is only supported on mainnet
var your_contract_address = '0x514910771AF9Ca656af840dff83E8264EcF986CA' // oijen: address of chainlink ERC20 token smart contract
var etherescan_url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${your_contract_address}&apikey=${etherscan_token}`
console.log(etherescan_url);

var client = require('node-rest-client-promise').Client();

// Now we are going to deal with the contract from web3.js in a non-block fashion (async mode)
client.getPromise(etherescan_url)
.then((client_promise) => {
  // Leave this two lines for fure object analisys
  //const util = require('util')
  //console.log(util.inspect(client_promise, false, null))

  // We get here your contract ABI
  your_contract_abi = JSON.parse(client_promise.data.result);

  // And now we create a promise to consume later
  return new Promise((resolve, reject) => {
      var your_contract = new web3.eth.Contract(your_contract_abi, your_contract_address);
      try {
        // If all goes well
        resolve(your_contract);
      } catch (ex) {
        // If something goes wrong
        reject(ex);
      }
    });

})
.then((your_contract) => {
  // Let's see your contract address
  console.log(`Your Contract address:  ${your_contract._address}`);

  // or in this other way
  console.log(`Your Contract address in other way:  ${your_contract.options.address}`);

  // Now your contract abi
  console.log("Your contract abi: " + JSON.stringify(your_contract.options.jsonInterface));

  // This is turning more interesting, let's see what's going with your contract methods
  // Now let's see your contract total supply in a callback fashion
  your_contract.methods.totalSupply().call(function(err, totalSupply) {
      if (!err) {
          console.log(`Total Supply with a callback:  ${totalSupply}`);
      } else {
          console.log(err);
      }
  });

  // Or you can use the returned Promise instead of passing in the callback:
  your_contract.methods.totalSupply().call().then(function(totalSupply){
      console.log(`Total Supply with a promise:  ${totalSupply}`);
  }).catch(function(err) {
      console.log(err);
  });

})
