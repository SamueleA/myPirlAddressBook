const node = new Ipfs();
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
      node.on('ready', () => {
        const hash = 'Qmaj3ZhZtHynXc1tpnTnSBNsq8tZihMuV34wAvpURPZZMs';
        node.files.cat(hash, (err, result)=>{
          if (err){
            console.log(err);
          }
          console.log(result.toString());
        });

      });
    }
  });



  //saving profile
  $('#saveProfile').click( () => {
    var dataTosave = vueInstance.persons;
    dataTosave = JSON.stringify(dataTosave);


  });

  //adding new user to address book
  $('#newUserButton').click( () => {
    var newUserTag = $('#newTag').val();
    var newUserAddress = $('#newAddress').val();
    vueInstance.persons.push({'tag':newUserTag, 'address': newUserAddress});
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
