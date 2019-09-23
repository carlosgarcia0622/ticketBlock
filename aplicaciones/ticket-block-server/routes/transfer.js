const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const JSON = require('circular-json');
const ccpPath = path.resolve('../', '../', 'connectionTicketBlock.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();

app.post('/transfer', async (req, res) => {

    let body = req.body

    //Parameters validation
    if ((!body.userName) || (!body.id) || (!body.owner) || (!body.newOwner)) {
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
        let responseTx = JSON.parse(await contract.submitTransaction('transfer', body.id, body.owner, body.newOwner));

        if(!responseTx.ok){
            return res.json({
                ok: false,
                response: responseTx.response.msg
            });
        }else{
            return res.json({
                ok: true,
                response: `ticket actualizado: \n${JSON.stringify(responseTx.response.ticket)}`
            });

        }




    } catch (error) {
        console.error(`Failed to submit transaction: ${error}\n`);
        return res.status(500).json({
            ok: false,
            response: `Failed to submit create ticket transaction`
        });
    }
});

module.exports = app;