#1. Generate Arttifacts 
#    a. Generate cryptographic material
#        i. cryptogen
            rm -rf crypto-config
            cryptogen generate --config=./crypto-config.yaml

#    b. Generate oher Arttifacts
        export FABRIC_CFG_PATH=$PWD
        rm -rf ./channel-artifacts/*
#        i. Create Genesis block
            mkdir channel-artifacts
            configtxgen -profile OrganChainOrdererGenesis \
                -channelID organ-sys-channel -outputBlock ./channel-artifacts/genesis.block
        
#        ii. Generate Channel Transaction Artifacts
            
            export CHANNEL_NAME=organ-channel  && configtxgen \
                -profile OrganChainChannel -outputCreateChannelTx \
                ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

#        iii. Specify Anchor peer for each organization
            
            configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate \
                ./channel-artifacts/HospitalMSPanchors.tx \
                -channelID $CHANNEL_NAME -asOrg HospitalMSP

            configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate \
                ./channel-artifacts/HLMSPanchors.tx \
                -channelID $CHANNEL_NAME -asOrg HLMSP

            configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate \
                ./channel-artifacts/OPOMSPanchors.tx \
                -channelID $CHANNEL_NAME -asOrg OPOMSP

            configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate \
                ./channel-artifacts/GPMSPanchors.tx \
                -channelID $CHANNEL_NAME -asOrg GPMSP

#2. Start Netwrok
#    a. Start Docker Nodes
        export COMPOSE_PROJECT_NAME=''
        docker-compose -p '' -f  docker-compose-cli.yaml up -d 
#       Move chaincode in cli container
#    b. Create Channel
        # docker exec -it cli bash

        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.hospital.organ.com:7051
        docker exec -it cli export CORE_PEER_LOCALMSPID="HospitalMSP"
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer0.hospital.organ.com/tls/ca.crt

        docker exec -it cli export CHANNEL_NAME=organ-channel

        docker exec -it cli  peer channel create -o orderer.organ.com:7050 \
            -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx \
            --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem
            
#    c. Join Peers


        # Environment variables for peer0.hospital

        docker exec -it cli export=CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
        docker exec -it cli export=CORE_PEER_ADDRESS=peer0.hospital.organ.com:7051
        docker exec -it cli export=CORE_PEER_LOCALMSPID="HospitalMSP"
        docker exec -it cli export=CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer0.hospital.organ.com/tls/ca.crt
        docker exec -it cli  peer channel join -b organ-channel.block

        # Environment variables for peer1.hospital

        docker exec -it cli CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
        docker exec -it cli  CORE_PEER_ADDRESS=peer1.hospital.organ.com:7051
        docker exec -it cli  CORE_PEER_LOCALMSPID="HospitalMSP"
        docker exec -it cli  CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer1.hospital.organ.com/tls/ca.crt
        docker exec -it cli  peer channel join -b organ-channel.block

        # Environment variables for peer0.hl

        docker exec -it cli CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/users/Admin@histocompatibility.organ.com/msp
        docker exec -it cli CORE_PEER_ADDRESS=peer0.histocompatibility.organ.com:7051
        docker exec -it cli CORE_PEER_LOCALMSPID="HLMSP"
        docker exec -it cli CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/peers/peer0.histocompatibility.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block

        # Environment variables for peer1.hl

        docker exec -it cli CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/users/Admin@histocompatibility.organ.com/msp
        docker exec -it cli CORE_PEER_ADDRESS=peer1.histocompatibility.organ.com:7051
        docker exec -it cli CORE_PEER_LOCALMSPID="HLMSP"
        docker exec -it cli CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/peers/peer1.histocompatibility.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block

        # Environment variables for peer0.opo

        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/users/Admin@opo.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.opo.organ.com:7051
        docker exec -it cli export CORE_PEER_LOCALMSPID="OPOMSP"
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/peers/peer0.opo.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block

        # Environment variables for peer1.opo

        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/users/Admin@opo.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer1.opo.organ.com:7051
        docker exec -it cli export CORE_PEER_LOCALMSPID="OPOMSP"
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/peers/peer1.opo.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block

        # Environment variables for peer0.gp

        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/users/Admin@gp.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.gp.organ.com:7051
        docker exec -it cli export CORE_PEER_LOCALMSPID="GPMSP"
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/peers/peer0.gp.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block


        # Environment variables for peer1.gp

        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/users/Admin@gp.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer1.gp.organ.com:7051
        docker exec -it cli export CORE_PEER_LOCALMSPID="GPMSP"
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/peers/peer1.gp.organ.com/tls/ca.crt
        docker exec -it cli peer channel join -b organ-channel.block

#    d. Update Anchor Peers
        #i. For Hospital
        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.hospital.organ.com:7051 CORE_PEER_LOCALMSPID="HospitalMSP" 
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer0.hospital.organ.com/tls/ca.crt 
        docker exec -it cli peer channel update -o orderer.organ.com:7050 \
            -c $CHANNEL_NAME -f ./channel-artifacts/HospitalMSPanchors.tx \
            --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem
       
        #ii. For OPO
        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/users/Admin@opo.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.opo.organ.com:7051 CORE_PEER_LOCALMSPID="OPOMSP" 
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/peers/peer0.opo.organ.com/tls/ca.crt 
        docker exec -it cli peer channel update -o orderer.organ.com:7050 \
            -c $CHANNEL_NAME -f ./channel-artifacts/OPOMSPanchors.tx \
            --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem
       

        #iii. For HL
        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/users/Admin@histocompatibility.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.histocompatibility.organ.com:7051 CORE_PEER_LOCALMSPID="HLMSP" 
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/peers/peer0.histocompatibility.organ.com/tls/ca.crt 
        docker exec -it cli peer channel update -o orderer.organ.com:7050 \
            -c $CHANNEL_NAME -f ./channel-artifacts/HLMSPanchors.tx \
            --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem
       

        #iv. For GP
        docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/users/Admin@gp.organ.com/msp
        docker exec -it cli export CORE_PEER_ADDRESS=peer0.gp.organ.com:7051 CORE_PEER_LOCALMSPID="GPMSP" 
        docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/peers/peer0.gp.organ.com/tls/ca.crt 
        docker exec -it cli peer channel update -o orderer.organ.com:7050 \
            -c $CHANNEL_NAME -f ./channel-artifacts/GPMSPanchors.tx \
            --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem
       

    
#    e. Run peer chaincode 
#        i. Init
#            1. For hospital
                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer0.hospital.organ.com:7051 CORE_PEER_LOCALMSPID="HospitalMSP"
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer0.hospital.organ.com/tls/ca.crt 
   
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/

                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/users/Admin@hospital.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer1.hospital.organ.com:7051 CORE_PEER_LOCALMSPID="HospitalMSP"
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospital.organ.com/peers/peer1.hospital.organ.com/tls/ca.crt 
   
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/

#            2. For OPOs
                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/users/Admin@opo.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer0.opo.organ.com:7051 CORE_PEER_LOCALMSPID="OPOMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/peers/peer0.opo.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/      

                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/users/Admin@opo.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer1.opo.organ.com:7051 CORE_PEER_LOCALMSPID="OPOMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/opo.organ.com/peers/peer1.opo.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/      

#            3. For Hls
                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/users/Admin@histocompatibility.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer0.histocompatibility.organ.com:7051 CORE_PEER_LOCALMSPID="HLMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/peers/peer0.histocompatibility.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/  

                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/users/Admin@histocompatibility.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer1.histocompatibility.organ.com:7051 CORE_PEER_LOCALMSPID="HLMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/histocompatibility.organ.com/peers/peer1.histocompatibility.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/      

#            4. For GPs
                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/users/Admin@gp.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer0.gp.organ.com:7051 CORE_PEER_LOCALMSPID="GPMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/peers/peer0.gp.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/

                docker exec -it cli export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/users/Admin@gp.organ.com/msp
                docker exec -it cli export CORE_PEER_ADDRESS=peer1.gp.organ.com:7051 CORE_PEER_LOCALMSPID="GPMSP" 
                docker exec -it cli export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/gp.organ.com/peers/peer1.gp.organ.com/tls/ca.crt 
                
                docker exec -it cli peer chaincode install -n organcc -v 1.0 \
                    -l node -p /opt/gopath/src/github.com/chaincode/

#        ii. Instantiate
            docker exec -it cli export CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=experiment1_organ_chain_network
            
            docker exec -it cli peer chaincode instantiate -o orderer.organ.com:7050 \
                --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/organ.com/orderers/orderer.organ.com/msp/tlscacerts/tlsca.organ.com-cert.pem \
                -C organ-channel -n organcc -l node -v 1.0 -c '{"Args":["initOrgan","123", "heart", "This is some donor info"]}' -P "OR ('HospitalMSP.peer','OPOMSP.peer', 'HLMSP.peer', 'GPMSP.peer')"

