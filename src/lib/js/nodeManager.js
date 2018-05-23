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
//publishVote(string _pName,bytes32 _objectId,uint _kind,uint _voteTime) 
	var voteObjectId = $("#voteObjectId").val();
	var voteName = $("#voteName").val();
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

function deleteNode(){

	var delNodeVoteProposalIndex = $("#delNodeVoteProposalIndex").val();
	var delNodeId = $("#delNodeId").val();
	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error,accounts){
		if(error){
			console.log(error);
		}
		var account = accounts[0];
		//alert("account: "+ account);
		//alert("blockNumber: "+ web3.eth.blockNumber);
		App.contracts.NodeManager.deployed()
		.then(function(instance){
			console.log(instance);
			return instance.delNode(delNodeVoteProposalIndex,strToHexCharCode(delNodeId),{from:account,gas: 3141592});
		}).then(function(result){
			alert("Delete node success !");
			console.log("Delete node success !");
                        console.log(result);
		}).catch(function(error){
			alert(error);
			alert("Delete node fail !");
			console.log("Delete node fail !");
			console.log(error);
		});
	});
}

function addNode(){

	web3 = new Web3(App.web3Provider);
	web3.eth.getAccounts(function(error, accounts) {
		if (error) {
		  console.log(error);
		}
		var account = accounts[0];	
		
		//alert("account: "+account);
		//alert("blockNumber: "+ web3.eth.blockNumber);
		
		App.contracts.NodeManager.deployed().then(function(instance) {			
			console.log(instance);
			var voteProposalIndex = $("#voteProposalIndex").val();
			var nodeId = $("#nodeId").val();
			var nodeAddress = $("#nodeAddress").val();
                        return instance.addNode(voteProposalIndex,strToHexCharCode(nodeId),parseInt(nodeAddress,16), {from: account,gas: 3141592});
		}).then(function(result) {
			alert("Add node success !");
			console.log("Add node success !"); 
                        console.log(result);
		}).catch(function(err) {
			alert("Add node fail !");
			alert(err);
			console.log("Add node fial !");
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

  function getNodeInfo(kind){
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

  function openNodeList(){

		$("#nodeList").html("");
		var account = null;
		var nodeContract = null;
		var nodeIndex = null;

		App.contracts.NodeManager.deployed().then(function(instance){
			nodeContract = instance;
			return nodeContract.getNodeIndex.call();
		}).then(function(result){
			//alert(result);
			console.log(result);
			nodeIndex = result.c[0];
		}).then(function(){
			for(var i = nodeIndex;i > 0;i--){
				nodeContract.getNodeInfoByIndex.call(i-1)
				.then(function(data){
                                    console.log(data);
					var html = ""
						+"<tr>"
							+"<td>"+i+"</td><td>"+hexCharCodeToStr(data[0])+"</td><td>"+data[1]+"</td><td>"+data[2]+"</td><td>"+data[3].c[0]+"</td>"
						+"</tr>";
					$("#nodeList").append(html);

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