import { expect } from "chai";
import pkg from 'hardhat';
const { ethers } = pkg;

import * as proofUtils from '../utils/utils.js';


describe("BBjs proof onchain verification testing", function () {

  this.timeout(1000000);

- it("Onchain verification",  async () => {
  const num_public_inputs = 2;

  let accounts = await ethers.getSigners();
  const deployer = accounts[0];

  const UltraVerifierFactory = await ethers.getContractFactory("UltraVerifier");
  const ultraVerifier = await UltraVerifierFactory.deploy();
  console.log(" ✅ Circuit verifier contract deployed successfully ✅ ");

  const inputs = {
    value: BigInt('0x0000000000000000000000000000000000000000000000000000000000000028'),
    C1: BigInt('0x0000000000000000000000000000000000000000000000000000000000000028')};

  console.log(" ⏳ Deployer is computing a mint circuit proof offchain ⏳");
  const proof_mint = await proofUtils.genProof(inputs);
  console.log(" 🆗 Deployer successfully computed a proof and checked it offchain 🆗 ");

  const sliced_proof = proof_mint.slice(num_public_inputs*32); //  bb.js appends the public inputs to the proof

  let public_inputs_sliced = [];
  for (let i = 0; i < num_public_inputs*32; i += 32) {
    public_inputs_sliced.push(proof_mint.slice(i, i + 32));
  }
  console.log(proof_mint);
  console.log("Public Inputs Sliced : " , public_inputs_sliced);
  let result = await ultraVerifier.verify(sliced_proof,public_inputs_sliced);
  console.log("Testing onchain verification : " , result);
  });

});