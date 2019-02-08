/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================

// ==== Invoke marbles ====
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble1","blue","35","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble2","red","50","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble3","blue","70","tom"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["transferMarble","marble2","jerry"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["transferMarblesBasedOnColor","blue","jerry"]}'
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["delete","marble1"]}'

// ==== Query marbles ====
// peer chaincode query -C myc1 -n marbles -c '{"Args":["readMarble","marble1"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getMarblesByRange","marble1","marble3"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getHistoryForMarble","marble1"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["getMarblesByRangeWithPagination","marble1","marble3","3",""]}'

// Rich Query (Only supported if CouchDB is used as state database):
// peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarblesByOwner","tom"]}'
// peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarbles","{\"selector\":{\"owner\":\"tom\"}}"]}'

// Rich Query with Pagination (Only supported if CouchDB is used as state database):
// peer chaincode query -C myc1 -n marbles -c '{"Args":["queryMarblesWithPagination","{\"selector\":{\"owner\":\"tom\"}}","3",""]}'

// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================
// peer chaincode invoke -C mychannel -n organs -c '{"Args":["initOrgan","Organ001","heart","The very long json"]}'


// ====CHAINCODE INSTALLATION ===
// CORE_LOGGING_PEER=debug ./peer chaincode install -l node -n organ -v v0 -p /home/thesis/ocean/fabric/organ_chain/chaincode
'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {
  async Init(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    console.info('=========== Instantiated OrganChain Chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    console.info('Transaction ID: ' + stub.getTxID());
    console.info(util.format('Args: %j', stub.getArgs()));

    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.log('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  // ===============================================
  // initMarble - create a new organ
  // ===============================================
  // async initMarble(stub, args, thisClass) {
  async initOrgan(stub, args, thisClass) {
    if (args.length !=3) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }
    // ==== Input sanitation ====
    console.info('--- start init organ ---')
    if (args[0].lenth <= 0) {
      throw new Error('1st argument must be a non-empty string');
    }
    if (args[1].lenth <= 0) {
      throw new Error('2nd argument must be a non-empty string');
    }
    if (args[2].lenth <= 0) {
      throw new Error('3rd argument must be a non-empty string');
    }
    // if (args[3].lenth <= 0) {
    //   throw new Error('4th argument must be a non-empty string');
    // }
    let organID = args[0];
    // let color = args[1].toLowerCase();
    let type = args[1].toLowerCase();

    // let owner = args[3].toLowerCase();
    let donorInfo = args[2].toLowerCase();

    // let size = parseInt(args[2]);
    // if (typeof size !== 'number') {
    //   throw new Error('3rd argument must be a numeric string');
    // }

    // // ==== Check if marble already exists ====
    // let marbleState = await stub.getState(marbleName);
    // if (marbleState.toString()) {
    //   throw new Error('This marble already exists: ' + marbleName);
    // }

    // ==== Check if organ already exists ====
    let organState = await stub.getState(organID);
    if (organState.toString()) {
      throw new Error('This Organ already exists: ' + organID);
    }

    // // ==== Create marble object and marshal to JSON ====
    // let marble = {};
    // marble.docType = 'marble';
    // marble.name = marbleName;
    // marble.color = color;
    // marble.size = size;
    // marble.owner = owner;

    // ==== Create marble object and marshal to JSON ====
    let organ = {};
    organ.docType = 'organ';
    organ.organID = organID;
    organ.type = type;
    organ.donorInfo = donorInfo;
    organ.owner = 'Donor';

    // === Save marble to state ===
    await stub.putState(organID, Buffer.from(JSON.stringify(organ)));
    // let indexName = 'color~name'
    // let colorNameIndexKey = await stub.createCompositeKey(indexName, [marble.color, marble.name]);
    // console.info(colorNameIndexKey);
    // //  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
    // //  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
    // await stub.putState(colorNameIndexKey, Buffer.from('\u0000'));
    // ==== Marble saved and indexed. Return success ====
    console.info('- end init organ');
  }

  // ===============================================
  // initCandidate - create a new candidate
  // ===============================================
  async initCandidate(stub, args, thisClass) {
      if (args.length !=3) {
        throw new Error('Incorrect number of arguments. Expecting 3');
      }
      // ==== Input sanitation ====
      console.info('--- start init candidate ---')
      if (args[0].lenth <= 0) {
        throw new Error('1st argument must be a non-empty string');
      }
      if (args[1].lenth <= 0) {
        throw new Error('2nd argument must be a non-empty string');
      }
      if (args[2].lenth <= 0) {
        throw new Error('3rd argument must be a non-empty string');
      }
      // if (args[3].lenth <= 0) {
      //   throw new Error('4th argument must be a non-empty string');
      // }
      let candidateID = args[0];
      // let color = args[1].toLowerCase();
      let candidateFor = args[1].toLowerCase();
  
      let candidateInfo = args[2].toLowerCase();
  
      // ==== Check if organ already exists ====
      let candidateState = await stub.getState(candidateID);
      if (candidateState.toString()) {
        throw new Error('This Candidate already exists: ' + candidateID);
      }
  
      // ==== Create Candidate object and marshal to JSON ====
      let candidate = {};
      candidate.docType = 'candidate';
      candidate.candidateID = candidateID;
      candidate.candidateFor = candidateFor;
      candidate.candidateInfo = candidateInfo;
  
      // === Save marble to state ===
      await stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
    
      // ==== Marble saved and indexed. Return success ====
      console.info('- end init organ');
  }

  // ===============================================
  // readOrgan - read a marble from chaincode state
  // ===============================================
  // async readMarble(stub, args, thisClass) {
  async readOrgan(stub, args, thisClass) {

    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the organ to query');
    }

    let organID = args[0];
    if (!organID) {
      throw new Error(' organID must not be empty');
    }
    let organAsbytes = await stub.getState(organID); //get the marble from chaincode state
    if (!organAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Organ does not exist: ' + organID;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.log(organAsbytes.toString());
    console.info('=======================================');
    return organAsbytes;
  }

  // ===============================================
  // readCandidate - read a marble from chaincode state
  // ===============================================
  async readCandidate(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the Candidate to query');
    }

    let candidateID = args[0];
    if (!candidateID) {
      throw new Error(' candidateID  must not be empty');
    }
    let candidateAsbytes = await stub.getState(candidateID); //get the marble from chaincode state
    if (!candidateAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Marble does not exist: ' + candidateID;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.log(candidateAsbytes.toString());
    console.info('=======================================');
    return candidateAsbytes;
  }


  // ===========================================================
  // transfer a organ by setting a new owner candidateID on the organ.
  // By default organ owner is donor.
  // ===========================================================
  // async transferMarble(stub, args, thisClass) {
  //   //   0       1
  //   // 'name', 'bob'
  //   if (args.length < 2) {
  //     throw new Error('Incorrect number of arguments. Expecting marblename and owner')
  //   }

  //   let marbleName = args[0];
  //   let newOwner = args[1].toLowerCase();
  //   console.info('- start transferMarble ', marbleName, newOwner);

  //   let marbleAsBytes = await stub.getState(marbleName);
  //   if (!marbleAsBytes || !marbleAsBytes.toString()) {
  //     throw new Error('marble does not exist');
  //   }
  //   let marbleToTransfer = {};
  //   try {
  //     marbleToTransfer = JSON.parse(marbleAsBytes.toString()); //unmarshal
  //   } catch (err) {
  //     let jsonResp = {};
  //     jsonResp.error = 'Failed to decode JSON of: ' + marbleName;
  //     throw new Error(jsonResp);
  //   }
  //   console.info(marbleToTransfer);
  //   marbleToTransfer.owner = newOwner; //change the owner

  //   let marbleJSONasBytes = Buffer.from(JSON.stringify(marbleToTransfer));
  //   await stub.putState(marbleName, marbleJSONasBytes); //rewrite the marble

  //   console.info('- end transferMarble (success)');
  // }

  async transferOrgan(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting organID and candidateID')
    }

    let organID = args[0];
    let newCandidate = args[1].toLowerCase();
    console.info('- start transferOrgan ', organID, newCandidate);

    let organAsBytes = await stub.getState(organID);
    if (!organAsBytes || !organAsBytes.toString()) {
      throw new Error('Organ does not exist');
    }
    let organToTransfer = {};
    try {
      organToTransfer = JSON.parse(organAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + organID;
      throw new Error(jsonResp);
    }
    console.info(organToTransfer);
    organToTransfer.owner = newCandidate; //change the owner

    let organJSONasBytes = Buffer.from(JSON.stringify(organToTransfer));
    await stub.putState(organID, organJSONasBytes); //rewrite the marble

    console.info('- end transferOrgan (success)');
  }



  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }


};

shim.start(new Chaincode());
