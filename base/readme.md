../fabric-samples/bin/cryptogen generate --config=./crypto-config.yaml 

../fabric-samples/bin/configtxgen -profile ticketblockOrdererGenesis -outputBlock ./channel-artifacts/genesis.block 

../fabric-samples/bin/configtxgen -profile ticketblockchannel -outputCreateChannelTx ./channel-artifacts/ticketblockchannel.tx -channelID ticketblockchannel 

docker-compose -f  docker-compose.yaml up -d

docker-compose  -f docker-compose.yaml down --volumes --remove-orphans