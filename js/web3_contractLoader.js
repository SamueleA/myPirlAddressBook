var eventStartBlock = 0;

var contract1Address = "0x97f50f41b3d68e14b4510cd273bedfc25f847ca0";
var contract1Abi = [{"constant":false,"inputs":[{"name":"IPFSHash","type":"bytes"}],"name":"updateAddressBook","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"addressBooks","outputs":[{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"}];

loadContracts(contract1Address, contract1Abi);

//takes arguments by pairs of 2
//function will load the contracts
//function returns an array of loaded contracts in the same order that they were input
//by default provides a loadedContracts[i].getAllEvents() utility method
//function emits the event 'contract_loaded' when contracts are loaded
function loadContracts() {
    window.loadedContracts = [];
    if (arguments.length <2 || arguments.length %2 == 1) {
      console.error('loadContracts: not enough arguments in function!' );
    }

    window.addEventListener(("load"), () => {

      // Checking i Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      }

      //create contracts array
      for (var i =0; i<arguments.length; i+=2 ){
        var contract = web3.eth.contract(arguments[i+1]).at(arguments[i]);
        window.loadedContracts.push(contract);
      }

      var contractEvent = new Event('contracts_loaded');
      window.dispatchEvent(contractEvent);

    });


}
