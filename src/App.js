import React, {Component} from 'react';
import './App.css';
import * as artifact from './contracts/Token'



class App extends Component {

    constructor(props) {
        super(props);

        window.apoWeb.setDefaultBlock('latest');

        this.contract = null;
        this.state = {
            address : null,
            balance : null,
            contract : null,
            tokenBalance: null,
        }
    }

    async componentDidMount() {

        let apoWeb = window.apoWeb;
        this.setState({address : apoWeb.defaultAddress.base58});
        let address = apoWeb.address.fromHex(artifact.networks['*'].address);
        console.log(artifact.abi, artifact.networks['*'].address, address)
        this.contract = apoWeb.contract(artifact.abi, address);
        console.log(this.contract)
        await this.refreshBalance();
        await this.refreshTokenBalance();
    }


    onClick = async () => {
        let apoWeb = window.apoWeb;
        const sendTransaction = await apoWeb.apo.sendTransaction("TKPzfsXRaDmdKh2GuouXw2eyK2HNH9FNQS", 1000);
        console.log('- Transaction:\n' + JSON.stringify(sendTransaction, null, 2), '\n');
    };

    refreshBalance = async () => {
        let apoWeb = window.apoWeb;
        this.state.address && (this.setState({balance : await apoWeb.apo.getBalance(this.address)}));
    };

    refreshTokenBalance = async () => {
        let apoWeb = window.apoWeb;
        this.state.address &&  this.contract.balances(this.state.address).call().then(output => {
            console.group('Contract "call" result');
            console.log('- Output:', output, '\n');
            this.setState({tokenBalance: output.toString()});
            console.groupEnd();
        });
    };

    async onCallContract () {
        let apoWeb = window.apoWeb;

        // 1. register event listener
        this.contract && this.contract.Approval().watch((err, event) => {
            if(err)
                return console.error('Error with "Message" event:', err);

            console.group('New event received');
            console.log('- Contract Address:', event.contract);
            console.log('- Event Name:', event.name);
            console.log('- Transaction:', event.transaction);
            console.log('- Block number:', event.block);
            console.log('- Result:', event.result, '\n');
            console.groupEnd();
        });

        this.contract && this.contract.Transfer().watch((err, event) => {
            if(err)
                return console.error('Error with "Message" event:', err);

            console.group('New event received');
            console.log('- Contract Address:', event.contract);
            console.log('- Event Name:', event.name);
            console.log('- Transaction:', event.transaction);
            console.log('- Block number:', event.block);
            console.log('- Result:', event.result, '\n');
            console.groupEnd();
        });


        // 2. send token
         let tx = this.contract.transfer("TKPzfsXRaDmdKh2GuouXw2eyK2HNH9FNQS", 100).send().then(output => {
            console.group('Contract "getLast" result');
            console.log('- Output:', output, '\n');
            console.groupEnd();
        });

    };

    render() {
        return (
            <div className="App">
                <div>
                    <p>current address</p>
                    <p>{this.state.address}</p>
                    <hr></hr>
                </div>
                    <p>current apo balance</p>
                    <p>{this.state.balance}</p>
                    <button onClick={this.refreshBalance}>Refresh balance</button>
                    <hr></hr>
                <div>
                </div>
                    <p>current token balance</p>
                    <p>{this.state.tokenBalance}</p>
                    <button onClick={this.refreshTokenBalance}>Refresh balance</button>
                    <hr></hr>
                <div>
                    <button onClick={this.onClick}>apo transfer</button>
                    <hr></hr>
                </div>
                <div>
                    <button onClick={() => this.onCallContract()}>token transfer</button>
                    <hr></hr>
                </div>
            </div>
        );
    }
}

export default App;
