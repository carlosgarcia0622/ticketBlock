const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const JSON = require('circular-json');
const ccpPath = path.resolve('../', '../', 'connectionTicketBlock.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const express = require('express');
const app = express();

app.post('/register-user', async (req, res) => {

    //req.body = {userName}

    if ((!req.body.userName)) {
        console.error(`Failed to send transaction: Missing arguments in request body \n`);
        return res.status(400).json({
            ok: false,
            response: 'Missing arguments in request body'
        });
    }


    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = (path.join(__dirname, '../', '../', 'ticket-block-wallet'))
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user
        const userExists = await wallet.exists(req.body.userName);
        if (userExists) {
            console.log('An identity for the user "user1" already exists in the wallet');
            return;
        }

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

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: req.body.userName, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: req.body.userName, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('OrgTicketBlockMSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import(req.body.userName, userIdentity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

        res.json({
            ok: true,
            response: `Successfully registered and enrolled admin user ${req.body.userName}  and imported it into the wallet`
        });

    } catch (error) {
        console.error(`Failed to register user ${req.body.userName}: ${error} \n`);
        res.status(500).json({
            ok: false,
            response: `Failed to register user ${req.body.userName}`
        });

    }

});



module.exports = app;