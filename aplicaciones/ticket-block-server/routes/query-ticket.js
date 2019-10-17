const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const JSON = require('circular-json');
const ccpPath = path.resolve('../', '../', 'connectionTicketBlock.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();

app.post('/query-ticket', async (req, res) => {

    //Parameters validation
    console.log(req.body)
    if(!req.body.code) {
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

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.error(`Run the enrollAdmin.js application before retrying\n`);
            return res.status(400).json({
                ok: false,
                response: 'An identity for the admin user "admin" does not exist in the wallet'
            });
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

        //Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('ticketblockchannel');

        //Get the contract from the network.
        const contract = network.getContract('tickets-chaincode');

        //Send transaction to the smart contract
        responseTx = ((await contract.evaluateTransaction('queryTicket', req.body.code.toString())).toString())

        console.log(responseTx.toString())

        return res.json(responseTx)

    } catch (error) {
        console.log(error)
    }
});

module.exports = app;