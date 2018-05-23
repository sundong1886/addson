var web3;
$(function() {
  $(window).load(function() {
    App.init();
  });
});

App = {
  web3Provider: null,
  contracts: {},

  init: function() {
     App.initWeb3();
  },

  initWeb3: function() {    
//		  if (web3 && typeof web3 !== 'undefined' && web3 !== 'unavailable') {
//			App.web3Provider = web3.currentProvider;
//		  } else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
//		  }
		web3 = new Web3(App.web3Provider);
		App.initContract();
  },

  initContract: function() {
	  $.getJSON('NodeManager.json', function(data) {
		var NodeArtifact = data;
		App.contracts.NodeManager = TruffleContract(NodeArtifact);
		App.contracts.NodeManager.setProvider(App.web3Provider);
	  });
  }
};


function publishVote(){

	var voteAddress = $("#voteAddress").val();
	var voteName = $("#voteName2").val();
	var voteKindNum = $("#voteKindNum").val();
	var voteTime = $("#voteTime").val();
	
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error,accounts){
		if(error){
			alert(error);
			conosle.log(error);
		}
		var account = accounts[0];
		App.contracts.NodeManager.deployed()
		.then(function(instance){
			//publishVote(address _addr,string _pName,uint _kind,uint _voteTime)
			return instance.publishVote(voteAddress,voteName,voteKindNum,voteTime,{from:account,gas:3141592});
		}).then(function(result){
				alert("Publish vote success !");
				console.log("Publish vote success !");
		}).catch(function(error){
			alert("Publish vote fail !");
			console.log("publish vote fail !");
			console.log(error);
		})

	})
}

function deleteVoteKind(){

	var kindNum = $("#voteKindNumber").val();
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error,accounts){
		if(error){
			console.log(error);
		}
		var account = accounts[0];
		alert("account: "+ account);
		alert("blockNumber: "+ web3.eth.blockNumber);
		App.contracts.NodeManager.deployed()
		.then(function(instance){
			console.log(instance);
			return instance.delVoteKind(kindNum,{from:account,gas: 3141592});
		}).then(function(result){
			alert("Delete vote kind success !");
			console.log("Delete vote kind success !");
		}).catch(function(error){
			alert(error);
			alert("Delete vote kind fail !");
			console.log("Delete vote kind fail !");
			console.log(error);
		});
	});
}

function addVoteKind(){
	// ��ȡ�û��˺�
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error, accounts) {
		if (error) {
		  console.log(error);
		}
		var account = accounts[0];	
		
		alert("account: "+account);
		alert("blockNumber: "+ web3.eth.blockNumber);
		//alert(web3.eth.defaultAccount);
		//alert(web3.eth.getBalance(account));
		//alert(web3.eth.getCode(account));
		//alert(web3.eth.getTransactionCount());
		//alert(web3.eth.getStorageAt());
		
		App.contracts.NodeManager.deployed().then(function(instance) {
			
			console.log(instance);
			var name = $("#voteKindName").val();
			var rate = $("#voteKindRate").val();
			var minTime = $("#voteKindMinTime").val();
			var maxTime = $("#voteKindMaxTime").val();
			var call = $("#voteKindCall").val();

			// ���ͶƱ����
			instance.addVoteKind(name,rate,minTime,maxTime,call, {from: account,gas: 3141592});
			return instance;
		}).then(function(instance) {
			alert("Add vote kind success !");
			console.log("Add vote kind success !");
			//var event = instance.transfer();
			
			//event.watch(function(error,result){
				//for (var i = 0;i< result.length;i++)
				//{
					//alert(result[i]);
					//console.log(result[i]);
				//}
			//});  
				
			//var events = instance.allEvents({fromBlock:0, toBlock: 'latest'});
			//events.watch(function(error, result){
			    //console.log(result);
				//alert(result);
			//});
			

			 
		}).catch(function(err) {
			alert("Add vote kind fail !");
			alert(err);
			console.log("Add vote kind fial !");
			console.log(err);
		});
	 });
}

  
  function getVoteKind()
  {
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error,accounts){
		if(error){
			console.log(error);
		}
		var account = accounts[0];
		alert(account);
		App.contracts.NodeManager.deployed().then(function(instance){
			alert("111");
			return instance.getVoteKindIndex.call();	
			//return instance.getVoteKindName.call(1);
		}).then(function(result){
			alert(result);
			console.log(result);
			getVoteKindInfo(result);
		}).catch(function(err){
			alert("333");
			alert(err);
			console.log(err);
		});
	});
  }

  function getVoteKindInfo(kind){
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error,accounts){
		if(error){
			console.log(error);
		}
		var account = accounts[0];
		alert(account);
		App.contracts.NodeManager.deployed().then(function(instance){
			return instance.getVoteKind.call(1);
		}).then(function(result){
			alert(result);
			console.log(result);
		}).catch(function(err){
			alert(err);
			console.log(err);
		});
	});
		
  }

  function openVoteKindList(){

		$("#voteKindList").html("");
		var account = null;
		var nodeContract = null;
		var voteIndex = null;

		App.contracts.NodeManager.deployed().then(function(instance){
			nodeContract = instance;
			return nodeContract.getVoteKindIndex.call();
		}).then(function(result){
			//alert(result);
			console.log(result);
			voteIndex = result.c[0];
		}).then(function(){
			for(var i = voteIndex;i > 0;i--){
				nodeContract.getVoteKind.call(i-1)
				.then(function(data){
					var html = ""
						+"<tr>"
							+"<td>"+data[0].c[0]+"</td><td>"+data[1]+"</td><td>"+data[2].c[0]+"</td><td>"
								+ data[3].c[0]+"</td><td>"+data[4].c[0]+"</td><td>"+data[5].c[0]+"</td><td>"+data[6]+"</td>"
						+"</tr>";
					$("#voteKindList").append(html);

				}).catch(function(err){
					alert(err);
					console.log(err);
				});
			}
		}).catch(function(err){
			alert(err);
			console.log(err);
		});

		

		
  }