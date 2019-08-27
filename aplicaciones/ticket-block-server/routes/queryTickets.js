const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const JSON = require('circular-json');
const ccpPath = path.resolve('../', '../', 'connectionTicketBlock.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();

app.get('/query-ticket', async (req, res) => {
    
        //Parameters validation
        if ((!req.body.id)||(!req.body.userName)) {
            console.error(`Failed to send transaction: Missing arguments \n`);
            return res.status(400).json({
                ok: false,
                response: {
                    msg: 'Missing arguments in request body'
                } 
            });
        }

        try {

        // Create a new file system based wallet for managing identities.
        const walletPath = (path.join(__dirname, '../', '../', 'ticket-block-wallet'))
        const wallet = new FileSystemWallet(walletPath);

        //Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(req.body.userName);
        if (!userExists) {
            console.error(`An identity for the user ${req.body.userName} does not exist in the wallet\n`);
            return res.status(400).json({
                ok: false,
                response: `User ${req.body.userName} does not exist in the wallet`
            });
        }

                //Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: req.body.userName, discovery: { enabled: false } });
        
                //Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('ticketblockchannel');
        
                //Get the contract from the network.
                const contract = network.getContract('tickets-chaincode');

                //Send transaction to the smart contract
                responseTx = ((await contract.evaluateTransaction('queryTicket', req.body.id)).toString())

                console.log(responseTx.toString())

                if(!responseTx){
                    return res.json({
                        ok: false,
                        response: 'Ticket no encontrado'
                    });
                }else{
        
                    return res.json({
                        ok: true,
                        response: responseTx
                    });
        
                }
            
        } catch (error) {
            console.log(error)            
        }
});

module.exports = app;