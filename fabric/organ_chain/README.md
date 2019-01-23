../bin/configtxgen -profile OrganChainOrdererGenesis -channelID organ-chain-sys-channel -outputBlock ./channel-artifacts/genesis.block



export CHANNEL_NAME=organ_chain_channel  && ../fabric-samples/bin/configtxgen -profile OrganChainChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME




../fabric-samples/bin/configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate ./channel-artifacts/HospitalMSPanchors.tx -channelID $CHANNEL_NAME -asOrg HospitalMSP

../fabric-samples/bin/configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate ./channel-artifacts/HLMSPanchors.tx -channelID $CHANNEL_NAME -asOrg HLMSP

../fabric-samples/bin/configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate ./channel-artifacts/OPOMSPanchors.tx -channelID $CHANNEL_NAME -asOrg OPOMSP

../fabric-samples/bin/configtxgen -profile OrganChainChannel -outputAnchorPeersUpdate ./channel-artifacts/GPMSPanchors.tx -channelID $CHANNEL_NAME -asOrg GPMSP