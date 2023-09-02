# bbjs-bug-minimal-example
A cleanly simplified bug when verifying proofs on-chain produced by bb.js
Steps to reproduce bug : 
1. Have nargo 10.3 installed and clone this repo.
   
2. Check that offchain verification works :
```
nargo prove && nargo verify
```

3. Then check that verification of the proof generated via `bb.js` (via `acir.createProof` function) leads to a failed proof when checked with the contract verifier:
```
npx hardhat test
```
