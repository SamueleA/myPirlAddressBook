var base58 = require('base-58');
const node = new Ipfs();
var contractsLoadedPs = new Promise( (resolve, reject)=>{
  window.addEventListener('contracts_loaded', ()=>{
    resolve();
  });
});

var nodeReadyPs = new Promise((resolve, reject)=>{
  node.on('ready', () => {
    resolve();
  });

});

$(document).ready(function(){
  // Checking i Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }


  web3.version.getNetwork((err, netId) => {
    if (netId != "1") {
      $(".warnings").show();
      $("#networkWarning").show();
    }
  });
  if (web3.eth.accounts.length == 0) {
    $(".warnings").show();
    $("#noWeb3AccountWarning").show();
  }

  var vueInstance = new Vue({
    el:'#mainVue',
    data:{
      userAddress: 0,
      userBalance: 0,
      persons: []
    },
    updated: function() {
      $('[data-toggle="popover"]')
        .on('click',function(e){
          e.preventDefault();
          return true;
        })
        .popover();
    },
    methods:{
      removeEntry: function(index) {
        this.persons.splice(index, 1);

      },
      sendEther: function(index) {
        document.querySelectorAll('.etherAmountInput').forEach((input)=>{
          if (input.value == 0)
            return;
          var toAddress = this.persons[index].address;
          var fromAddress = web3.eth.accounts[0];
          var weiAmount = web3.toWei(input.value, 'ether');
          web3.eth.sendTransaction({from:fromAddress, to:toAddress, value:weiAmount}, function(e, r){
            if(e) {
              console.error(e);
            }
            console.log(r);
          });
        });
      }
    },
    mounted: function() {
      Promise.all([contractsLoadedPs, nodeReadyPs]).then(()=>{
        console.log('Contracts and node are ready!');
        window.loadedContracts[0].addressBooks(web3.eth.accounts[0], (err, res)=>{
            console.log('Retrieved data from blockchain');
            res = res.slice(2);
            var multihash1 = '12';
            var multihash2 = '20';
            var hash = multihash1.toString() + multihash2.toString() + web3.toAscii(res);
            var hashArray =[];
            for(var i=0;i<hash.length;i+=2) {
              var toDec = web3.toDecimal('0x' + hash.charAt(i)+hash.charAt(i+1));
              hashArray.push(toDec);
            }
            var uint8Hash = Uint8Array.from(hashArray);
            var base58Hash = base58.encode(uint8Hash);
            console.log('IPFS node searching for ' + base58Hash);
            node.files.cat(base58Hash, (err, result)=>{
              if (err){
                console.log(err);
              }
              console.log('Retrieved data from IPFS');
              vueInstance.persons = JSON.parse(result);
            });
        });
      });
    }
  });

  //saving profile
  $('#saveProfile').click( () => {
    var dataTosave = vueInstance.persons;
    dataTosave = JSON.stringify(dataTosave);
    node.files.add({
      path:'profile.json',
      content: Buffer.from(dataTosave)
    }, (err, filesAdded)=>{
      if(err){
        console.log(err);
      }
      console.log('Address book added to IPFS with hash '  + filesAdded[0].hash);
      var decode = base58.decode(filesAdded[0].hash);
      var decodeHex =[]
      decode.map((byte)=>{
        if (byte.toString(16).length==1) {
          decodeHex.push( '0' + byte.toString(16));
        }
        else {
          decodeHex.push(byte.toString(16));
        }
      });
      var formattedHash = decodeHex.slice(2).join("");
      window.loadedContracts[0].updateAddressBook(formattedHash, (err, res)=>{
        if (err) {
          console.log(err);
        }
        console.log('IPFS hash saved to the blockchain!');
      });
    });

  });

  //adding new user to address book
  $('#newUserButton').click( () => {
    var newUserTag = $('#newTag').val();
    var newUserAddress = $('#newAddress').val();
    vueInstance.persons.push({'tag':newUserTag, 'address': newUserAddress});
    $('#newTag').val('');
    $('#newAddress').val('');

  });

  resize();
  $(window).resize(resize());
  function resize(){
    if (!window.matchMedia("(max-width: 700px)").matches) {
      //main scrollbars
      $('body').mCustomScrollbar({
        scrollButtons: {
          enable:true
        },
        theme:"inset-dark",
        scrollInertia:150,
        autoHideScrollbar:false
      });
    }
  }

    //user info
    vueInstance.userAddress = web3.eth.accounts[0];
    web3.eth.getBalance(vueInstance.userAddress , (err, res) =>{
      vueInstance.userBalance = res;
    });

});
