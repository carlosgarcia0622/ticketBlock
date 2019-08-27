const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const JSON = require('circular-json');
const ccpPath = path.resolve('../', '../', 'connectionTicketBlock.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();

app.post('/createTickets', async (req, res) => {

    //req.body = {userName, amount, ticket: {id , expedition, expitation, state, owner, price, resale, issuer, event, data:{} }} //Headers:token
    let ticket = req.body.ticket;
    let body = req.body

    //Parameters validation
    if ((!ticket.id) || (!ticket.expedition) || (!ticket.expiration) || (!ticket.price) || (!ticket.resale) || (!ticket.issuer) || (!ticket.event) || (!ticket.data) || (!body.amount)) {
        console.error(`Failed to send transaction: Missing arguments\n`);
        return res.status(400).json({
            ok: false,
            response: 'Missing arguments in request body'
        });
    }

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = (path.join(__dirname, '../', '../', 'ticket-block-wallet'))
        const wallet = new FileSystemWallet(walletPath);

        //Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(body.userName);
        if (!userExists) {
            console.error(`An identity for the user ${body.userName} does not exist in the wallet\n`);
            return res.status(400).json({
                ok: false,
                response: `User ${body.userName} does not exist in the wallet`
            });
        }

        //Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: body.userName, discovery: { enabled: false } });

        //Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('ticketblockchannel');

        //Get the contract from the network.
        const contract = network.getContract('tickets-chaincode');

        //Send transaction to the smart contract
        let responseTx = JSON.parse((await contract.submitTransaction('createTickets', ticket.id, ticket.expedition, ticket.expiration, "En venta", ticket.issuer, ticket.price, ticket.resale, ticket.issuer, ticket.event, JSON.stringify(ticket.data), body.amount)).toString());

        for (let i = 0; i < (responseTx).length; i++) {
            console.log(`\n ${JSON.stringify(responseTx[i])}`);

        }

        let response = {
            ok: true,
            response: {
                responseTx
            }
        };


         network.addBlockListener('my-block-listener',  ((err, block) => {
            if (err) {
                console.error(err);
                return;
            }

            let blockInfo ={
                blockNumber : block.header.number,
                data_hash : block.header.data_hash,
                //previous_hash : block.header.previous_hash,
                tx_id: block.data.data[0].payload.header.channel_header.tx_id
            }
            
            // response.blockInfo = blockInfo
            console.log(blockInfo)
        }));


        setTimeout(()=>{
            return res.json(response)
        },200)
        


    } catch (error) {
        console.error(`Failed to submit transaction: ${error}\n`);
        return res.status(500).json({
            ok: false,
            response: `Failed to submit create ticket transaction`
        });
    }
});

module.exports = app;