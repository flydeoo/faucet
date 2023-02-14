const Web3 = require('web3');
var web3;

// Using a remote node provider like Alchemy
const httpsProvider = ""; 

// faucet contract address
const faucetContractAddr = "";

// faucet contract abi
const abi = [];

// private key, need an account private key in hex format to pay fees and send transactions to the faucet contract
const pk = "";



async function connectionTester() {
    try {

        const isListen = await web3.eth.net.isListening();

        if (!isListen) {
            console.log("\t==>connectionTester(): web3 object [+], connected [-]");
            return false;
        } else {
            console.log("\t==>connectionTester(): web3 object [+], connected [+]");
            return true;
        }

    } catch (err) {
        console.log("\t==> connectionTester: ", err);
        return false;
    }
}


// responsible to initate the web3 object and return boolean on whether the web3 object initate and connected successfully.
async function connect() {

    try {
        web3 = await new Web3(httpsProvider);
        return await connectionTester();

    } catch (error) {
        console.log("\t==>connect(): " + error);
        return false;
    }

}





// first time connection on server start
const makeConnectionRes = connect();
console.log("\t==> main: make new connection result(connect function return): ", makeConnectionRes);




const controller = {
    home: function (req, res) {
        res.render('faucet', { title: 'faucet file', message: 'welcome' });
    },

    submit: async function (req, res) {
        console.log('*************************************');
        res.write("==> form received\n");
        let wallet = req.body.wallet;


        var isConnected = await connectionTester();
        if (isConnected) {
            console.log("\t==> main: status[live]");
        } else {
            console.log("\t==> main: status[probably offline]");
            retry = 0;
            console.log('\t==> main: retry logs: ')
            var tempStatus = await connectionTester();
            while (!tempStatus && retry < 3) {
                retry += 1;
                console.log("\t\t==> main: retry number: ", retry);
                tempStatus = await connect();
            }

            if (!tempStatus) {
                console.log("\t\t==> main: max listen retry reached. function stoped.");
                console.log('*************************************');
                res.write("internal error. please retry.");
                res.end();
                return;
            } else {
                console.log("\t\t==> main: status[live]");

            }

        }



        const isAddr = web3.utils.isAddress(wallet);
        if (!isAddr) {
            res.write("address is not valid");
            res.end();

            return;
        }
        console.log("\t==> main: address is valid");




        // create contract object
        const faucetContract = new web3.eth.Contract(abi, faucetContractAddr);

        // encode the function call data
        const faucetdata = faucetContract.methods.sendEth(wallet).encodeABI();

        let signedTrx;
 
        let result;

        try {
            result = await web3.eth.accounts.signTransaction({
                to: faucetContractAddr,
                gas: 40000,
                data: faucetdata

            }, pk);


        } catch (err) {
            console.error("\t==> main: error in create a signed trx, " + err);
            return
        }



        console.log("\t==> main: created signed trx. raw result is: \"" + result.rawTransaction + "\"");
        signedTrx = result;


        try {
            const final = await web3.eth.sendSignedTransaction(signedTrx.rawTransaction)
                .once('sending', function (payload) { console.log("\t==> main: this is emitted before the request is sent to the Ethereum network"); })
                .once('sent', function (payload) { console.log("\t==> main: the network has received and started processing the transaction") })
                .once('transactionHash', function (hash) {
                    console.log("\t==> main: the transaction is successfully broadcasted to the network with hash: ", hash, "  but it is not mined and included in a block");
                    res.write("here is trx hash: https://goerli.etherscan.io/tx/" + hash);
                    res.end();

                })


            console.log("\t==> main: done");


        } catch (error) {
            console.error("\t==> main: error in trx: " + error.message);


        }




    }




}

module.exports = controller;