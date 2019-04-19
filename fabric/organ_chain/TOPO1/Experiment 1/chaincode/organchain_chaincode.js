/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================

// ==== Invoke marbles ====
// peer chaincode invoke -C myc1 -n marbles -c '{"Args":["initMarble","marble1","blue","35","tom"]}'

// peer chaincode invoke -C organ-channel -n organcc -c '{"Args":["initOrgan","123","heart","THis is a good heart"]}'


// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================
// peer chaincode invoke -C $CHANNEL_NAME -n organs -c '{"Args":["initOrgan","Organ001","heart","The very long json"]}'


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
  // initOrgan - create a new organ
  // ===============================================

  async initOrgan(stub, args, thisClass) {
    console.info("This is chaincode version 123.")
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

    let organID = args[0];
  
    let type = args[1].toLowerCase();

    let donorInfo = args[2].toLowerCase();


    // ==== Check if organ already exists ====
    let organState = await stub.getState(organID);
    if (organState.toString()) {
      throw new Error('This Organ already exists: ' + organID);
    }


    // ==== Create organ object and marshal to JSON ====
    let organ = {};
    organ.docType = 'organ';
    organ.organID = organID;
    organ.type = type;
    organ.donorInfo = donorInfo;
    organ.owner = 'Donor';
    // ====== Find and match to a candidate ===========//
    // === Find a  match ===
      let startKey = '';
      let endKey = '';
      let iterator = await stub.getStateByRange(startKey, endKey);
      let allResults = [];
      let candidateInfoJSON = {};
      console.info("Looping through the iterator 125")
      while (true) {
        let res = await iterator.next();
        if (res.value && res.value.value.toString()) {
          let jsonRes = {};
          console.info(res.value.value.toString('utf8'));

          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            // console.info(jsonRes.Record.owner);
            // console.info("Look Here for [jsonRes.Key] -> " + typeof(JSON.parse(jsonRes.Record.donorInfo)));
            candidateInfoJSON = JSON.parse(jsonRes.Record.candidateInfo);
            // console.info("Look Here for [donorInfoJSON.legally_brain_dead]" + donorInfoJSON.legally_brain_dead);
          } catch (err) {
            console.info(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
          if(jsonRes.Record.organ=="None"){
            allResults.push(jsonRes.Record.candidateID);
          }
        }
        if (res.done) {
          console.info('end of data');
          await iterator.close();
          console.info("Available Candidates are "+ allResults);
          break;
        }
      
      }
      // ====================================
      // Starting transfer
      // ====================================
      let candidateID;
      let keys= [];
      let candidateToTransfer = {};
      let organInfoinJSON = {};
      let candidateInfoinJSON = {};
      let matchPerCent = 0;
      for(const value of allResults){
        let candidateAsBytes = await stub.getState(value);
        if (!candidateAsBytes || !candidateAsBytes.toString()) {
          throw new Error('Candidate does not exist');
        }
       
        try {
          candidateToTransfer = JSON.parse(candidateAsBytes.toString()); //unmarshal
        } 
        catch (err) {
          let jsonResp = {};
          jsonResp.error = 'Failed to decode JSON of: ' + value;
          throw new Error(jsonResp);
        }
        console.log(candidateToTransfer);
        
        // ============ Print Candidate Info
        console.info("Starting to Printing Matched Candidate's Info's Keys")
        organInfoinJSON = JSON.parse(organ.donorInfo);
        candidateInfoinJSON = JSON.parse(candidateToTransfer.candidateInfo);
        keys = Object.keys(organInfoinJSON)
        for(var key in keys){
          
          if(organInfoinJSON[keys[key]]==candidateInfoinJSON[keys[key]]){
            matchPerCent+=1
          } 
        }
        console.info("Done Printing Matched Donor's Info's Keys")
        // console.info("Look Here -> " + organ.donorInfo.legally_brain_dead)
        // ============ End Print Donor Info
        //If the match percent is greater than 90, then transfer
        matchPerCent = matchPerCent/keys.length
        if((matchPerCent)>=0.90){
          console.info("The match percent is "+ matchPerCent)
          console.info("Matching "+ organ.organID +" to "+ candidateToTransfer.candidateID)
          organ.owner = candidateToTransfer.candidateID;
          candidateToTransfer.organ = organID;
          await stub.putState(candidateToTransfer.candidateID, Buffer.from(JSON.stringify(candidateToTransfer)));
          break;
        }
        else{
          console.info("The match percent is "+ matchPerCent)
          console.info("Cannot find any candidate for organ " + organ.organID)
        }
        
      }
  
      // === Save Candidate to state ===
      await stub.putState(candidateToTransfer.candidateID, Buffer.from(JSON.stringify(candidateToTransfer)));
      console.info("initOrgan[Transaction ID] :" + stub.getTxID())
      console.info("initOrgan[Transaction Timestamp] :" + Date.parse(stub.getTxTimestamp()))
    // ====== Done Matching ===========================//
    // === Save organ to state ===
    await stub.putState(organID, Buffer.from(JSON.stringify(organ)));
    
    // ==== organ saved and indexed. Return success ====
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

      let candidateID = args[0];
      let candidateFor = args[1].toLowerCase();
      let candidateInfo = args[2].toLowerCase();
  
      // ==== Check if Candidate already exists ====
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
      candidate.organ = "None";

      // === Find a  match ===
      // availableOrgans = queryAllorgans()
      let startKey = '';
      let endKey = '';
      let iterator = await stub.getStateByRange(startKey, endKey);
      let allResults = [];
      let donorInfoJSON = {};
      console.info("Looping through the iterator 124")
      while (true) {
        let res = await iterator.next();
        if (res.value && res.value.value.toString()) {
          let jsonRes = {};
          console.info(res.value.value.toString('utf8'));

          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            // console.info(jsonRes.Record.owner);
            // console.info("Look Here for [jsonRes.Key] -> " + typeof(JSON.parse(jsonRes.Record.donorInfo)));
            donorInfoJSON = JSON.parse(jsonRes.Record.donorInfo);
            // console.info("Look Here for [donorInfoJSON.legally_brain_dead]" + donorInfoJSON.legally_brain_dead);
          } catch (err) {
            console.info(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
          if(jsonRes.Record.owner=="Donor"){
            allResults.push(jsonRes.Record.organID);
          }
        }
        if (res.done) {
          console.info('end of data');
          await iterator.close();
          console.info("Available organs are "+ allResults);
          break;
        }
      
      }
      // ====================================
      // Starting transfer
      // ====================================
      let organID;
      let keys= [];
      let organToTransfer = {};
      let organInfoinJSON = {};
      let candidateInfoinJSON = {};
      let matchPerCent = 0;
      for(const value of allResults){
        let organAsBytes = await stub.getState(value);
        if (!organAsBytes || !organAsBytes.toString()) {
          throw new Error('Organ does not exist');
        }
       
        try {
          organToTransfer = JSON.parse(organAsBytes.toString()); //unmarshal
        } 
        catch (err) {
          let jsonResp = {};
          jsonResp.error = 'Failed to decode JSON of: ' + value;
          throw new Error(jsonResp);
        }
        console.log(organToTransfer);
        
        // ============ Print Donor Info
        console.info("Starting to Printing Matched Donor's Info's Keys")
        organInfoinJSON = JSON.parse(organToTransfer.donorInfo);
        candidateInfoinJSON = JSON.parse(candidate.candidateInfo);
        keys = Object.keys(organInfoinJSON)
        for(var key in keys){
          
          if(organInfoinJSON[keys[key]]==candidateInfoinJSON[keys[key]]){
            matchPerCent+=1
          } 
        }
        console.info("Done Printing Matched Donor's Info's Keys")
        console.info("Look Here -> " + organToTransfer.donorInfo.legally_brain_dead)
        // ============ End Print Donor Info
        //If the match percent is greater than 90, then transfer
        matchPerCent = matchPerCent/keys.length
        if((matchPerCent)>=0.90){
          console.info("The match percent is "+ matchPerCent)
          console.info("Transfering "+ organToTransfer.organID +" to "+ candidateID)
          organToTransfer.owner = candidateID;
          candidate.organ = organToTransfer.organID;
          organID = organToTransfer.organID;
          await stub.putState(organID, Buffer.from(JSON.stringify(organToTransfer)));
          break;
        }
        else{
          console.info("The match percent is "+ matchPerCent)
          console.info("Cannot transfer any organ to " + candidateID)
        }
        
      }
  
      // === Save Candidate to state ===
      await stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
      console.info("initCandidate[Transaction ID] :" + stub.getTxID())
      console.info("initCandidate[Transaction Timestamp] :" + Date.parse(stub.getTxTimestamp()))
      console.info("initCandidate[Transaction Timestamp] :" +(stub.getTxTimestamp()))
      // ==== Candidate saved and indexed. Return success ====
      console.info('- end init organ');
    }

  // ===============================================
  // readOrgan - read a organ from chaincode state
  // ===============================================
  async readOrgan(stub, args, thisClass) {

    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the organ to query');
    }

    let organID = args[0];
    if (!organID) {
      throw new Error(' organID must not be empty');
    }
    let organAsbytes = await stub.getState(organID); //get the organ from chaincode state
    if (!organAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Organ does not exist: ' + organID;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.info(organAsbytes.toString());
    console.info('=======================================');
    return organAsbytes;
  }

  // ===============================================
  // readCandidate - read a candidate from chaincode state
  // ===============================================
  async readCandidate(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the Candidate to query');
    }

    let candidateID = args[0];
    if (!candidateID) {
      throw new Error(' candidateID  must not be empty');
    }
    let candidateAsbytes = await stub.getState(candidateID); //get the candidate from chaincode state
    if (!candidateAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Candidate does not exist: ' + candidateID;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.log(candidateAsbytes.toString());
    console.info('=======================================');
    return candidateAsbytes;
  }

  async transferOrgan(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting organID and candidateID')
    }

    let organID = args[0];
    let newCandidate = args[1];
    console.info('- start transferOrgan ', organID, newCandidate);

    let organAsBytes = await stub.getState(organID);
    if (!organAsBytes || !organAsBytes.toString()) {
      throw new Error('Organ does not exist');
    }
    let candidateAsBytes = await stub.getState(newCandidate);
    if (!candidateAsBytes || !candidateAsBytes.toString()) {
      throw new Error('Candidate does not exist');
    }
    // Updating Organ Entry
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
    await stub.putState(organID, organJSONasBytes); //rewrite the candidate

  // Updating Candidate Entry 
  let candidateToTransfer = {};
    try {
      candidateToTransfer = JSON.parse(candidateAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + newCandidate;
      throw new Error(jsonResp);
    }
    console.info(candidateToTransfer);
    candidateToTransfer.organ = organID; //change the owner

    let candidateJSONasBytes = Buffer.from(JSON.stringify(candidateToTransfer));
    await stub.putState(newCandidate, candidateJSONasBytes); //rewrite the candidate


    console.info('- end transferOrgan (success)');
  }

  async readCandidateByMathched(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the Candidate to query');
    }

    let candidateID = args[0];
    if (!candidateID) {
      throw new Error(' candidateID  must not be empty');
    }
    let organ = "None"
    let candidateAsbytes = await stub.getStateByRange(); //get the candidate from chaincode state
    if (!candidateAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'Candidate does not exist: ' + candidateID;
      throw new Error(JSON.stringify(jsonResp));
    }
    try {
      for(i = 0; i<candidateAsbytes.length; i++){
      candidate = JSON.parse(candidateAsbytes.pop().toString()); //unmarshal
      console.log(candidate.candidateID)
      console.log(candidate.organ)
      }
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + organID;
      throw new Error(jsonResp);
    }
    console.info('=======================================');
    console.log(candidateAsbytes.toString());
    console.info('=======================================');
    creator = stub.getCreator()
    txID = stub.getTxID()
    console.log(creator)
    console.log(txID)
    txTimestamp = stub.txTimestamp()
    console.log(txTimestamp)

    return candidateAsbytes;
  }
  async queryAllorgans(stub, args) {

    let startKey = '';
    let endKey = '';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          console.log(jsonRes.Record.organ)
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        if(jsonRes.Record.organ=="None"){
          allResults.push(jsonRes.Record.candidateID);
        }
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }
  async queryAllcandidates(stub, args) {

    let startKey = '';
    let endKey = '';

    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          console.log(jsonRes.Record.owner)
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString('utf8');
        }
        if(jsonRes.Record.owner=="Donor"){
          allResults.push(jsonRes.Record.candidateID);
        }
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

};

shim.start(new Chaincode());
