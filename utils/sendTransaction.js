const { Framework } = require("@vechain/connex-framework");
const { Driver, SimpleNet } = require("@vechain/connex-driver");
const { Transaction, secp256k1 } = require("thor-devkit");
const axios = require("axios");
const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");

const DECIMALS = function (points) {
  return new BigNumber(10 ** points); // Decimals = 18 on VTHO and most contracts.
};

const evmToHuman = function (aBigNumber) {
  return aBigNumber.dividedBy(DECIMALS(18));
};

exports.sendTransaction = async (points, to) => {
  
  try {
    const net = new SimpleNet("https://testnet.veblocks.net");
    const driver = await Driver.connect(net);
    const framework = new Framework(driver);

    const contractAddress = "0x6e795B1cA55E38BD8eFa9b2AC5C902F20e2cb4e9";

    const abi = {
      inputs: [
        {
          internalType: "address",
          name: "_beneficiary",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_amount",
          type: "uint256",
        },
      ],
      name: "transferFromEcosystemShare",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    };

    const contract = framework.thor.account(contractAddress);
    const transfer = contract.method(abi);
    const clause = [transfer.asClause(to, points.concat("0".repeat(18)))];

    const tx = new Transaction({
      chainTag: Number.parseInt(framework.thor.genesis.id.slice(-2), 16),
      blockRef: framework.thor.status.head.id.slice(0, 18),
      expiration: 720,
      clauses: clause,
      gas: framework.thor.genesis.gasLimit,
      gasPriceCoef: 128,
      dependsOn: null,
      nonce: Math.ceil(Math.random() * 1000000000),
    });

    const mnemonic = process.env.MNEMONIC;
    const wallet = ethers.Wallet.fromPhrase(mnemonic);

    const signingHash = tx.signingHash();

    const originSignature = secp256k1.sign(
      signingHash,
      Buffer.from(wallet.privateKey.slice(2), "hex")
    );
    tx.signature = originSignature;

    const txBytes = tx.encode();

    const response = await axios.post(
      "https://testnet.veblocks.net/transactions",
      {
        raw: `0x${txBytes.toString("hex")}`,
      }
    );

    return response.data.id;
  } catch (err) {
    console.log(err);
  }
};

exports.getBalance = async (address) => {
  try {
    const net = new SimpleNet("https://testnet.veblocks.net");
    const driver = await Driver.connect(net);
    const framework = new Framework(driver);

    const contractAddress = "0xff2926c7CF664C2F452dB6eE30E780185e5a4b84";

    const abi = {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "balance",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    };

    const contract = framework.thor.account(contractAddress);
    const balance = contract.method(abi);

    const response = await balance.call(address);

    const userBalance = response.decoded[0].toString();

    return evmToHuman(new BigNumber(userBalance));
  } catch (err) {
    console.log(err);
  }
};
