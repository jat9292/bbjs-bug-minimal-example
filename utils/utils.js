import circuit from '../target/bbjs.json' assert { type: 'json' };
import { Crs, newBarretenbergApiAsync, RawBuffer } from '@aztec/bb.js/dest/node/index.js';
import { ethers } from 'ethers';
import { executeCircuit, compressWitness } from '@noir-lang/acvm_js';
import { decompressSync } from 'fflate';


export async function genProof(inputs){

  const acirBuffer = Buffer.from(circuit.bytecode, 'base64');
  const acirBufferUncompressed = decompressSync(acirBuffer);
  const api = await newBarretenbergApiAsync(4);
  const [exact, circuitSize, subgroup] = await api.acirGetCircuitSizes(acirBufferUncompressed);
  const subgroupSize = Math.pow(2, Math.ceil(Math.log2(circuitSize)));
  const crs = await Crs.new(subgroupSize + 1);
  await api.commonInitSlabAllocator(subgroupSize);
  await api.srsInitSrs(new RawBuffer(crs.getG1Data()), crs.numPoints, new RawBuffer(crs.getG2Data()));
  const acirComposer = await api.acirNewAcirComposer(subgroupSize);

  async function generateWitness(input, acirBuffer) {
    const initialWitness = new Map();

    let k = 0;
    for (let key in input) {
      k+=1;
      initialWitness.set(k, ethers.utils.hexZeroPad(`0x${input[key].toString(16)}`, 32));
    }

    const witnessMap = await executeCircuit(acirBuffer, initialWitness, () => {
      throw Error('unexpected oracle');
    });

    const witnessBuff = compressWitness(witnessMap);
    return witnessBuff;
  }

  async function generateProof(witness) {
    const proof = await api.acirCreateProof(
      acirComposer,
      acirBufferUncompressed,
      decompressSync(witness),
      false,
    );
    return proof;
  }

  async function verifyProof(proof) {
    await api.acirInitProvingKey(acirComposer, acirBufferUncompressed);
    const verified = await api.acirVerifyProof(acirComposer, proof, false);
    return verified;
  }

  const witness = await generateWitness(inputs, acirBuffer);
  console.log('Witness generated!');
  const proof = await generateProof(witness);
  console.log('Proof generated!');
  await verifyProof(proof);
  console.log('Proof verified!');
  api.destroy();
  
  return proof;
}