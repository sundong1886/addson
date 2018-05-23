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
	var nodeId = $("#nodeId").val();
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
			return instance.publishVote(strToHexCharCode(nodeId),voteName,strToHexCharCode(voteObjectId),voteKindNum,voteTime,{from:account,gas:3141592});
		}).then(function(result){
                        alert("Publish vote success !");
                        console.log("Publish vote success ! ");
		}).catch(function(error){
			alert("Publish vote fail !");
			console.log("publish vote fail !");
			console.log(error);
		});
	});
}
function getVoteInfoByPin(){
    $("#voteInfo").html("");
    var proposalIndex = $("#proposalIndex").val();
    App.contracts.NodeManager.deployed()
        .then(function(instance){
                console.log(instance);
                return instance.getVoteInfoByIndex.call(proposalIndex);
        }).then(function(data){
                console.log(data);
                var html = getVoteProposalHtml(data);
                $("#voteInfo").html(html);
                $("#voteProposalIndex").val(data[0].c[0]);
        }).catch(function(error){
                alert(error);
                alert("getVoteInfo fail !");
                console.log("getVoteInfo fail !");
                console.log(error);
        });
}
function voting(){
	var nodeId = $("#voteingNodeId").val();
	var voteProposalIndex = $("#voteProposalIndex").val();     
        var approval = $("#approval").prop('checked');
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
			return instance.voting(strToHexCharCode(nodeId),voteProposalIndex,approval?1:0,{from:account,gas: 3141592});
		}).then(function(result){
			alert("Voted success !");
			console.log("Voted success !");
		}).catch(function(error){
			alert(error);
			alert("Voted fail !");
			console.log("Voted fail !");
			console.log(error);
		});
	});
}
  function openVoteProposalList(){
		$("#proposalList").html("");
		var nodeContract = null;
		var voteIndex = null;
		App.contracts.NodeManager.deployed().then(function(instance){
			nodeContract = instance;
			return nodeContract.getVoteIndex.call();
		}).then(function(result){
			//alert(result);
			console.log(result);
			voteIndex = result.c[0];
		}).then(function(){
			for(var i = voteIndex;i > 0;i--){
				nodeContract.getVoteInfoByIndex.call(i-1)
				.then(function(data){
                                    console.log(data);
					var html = ""
						+"<tr>"+getVoteProposalHtml(data)+"</tr>";
					$("#proposalList").append(html);

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
  
  function getVoteProposalHtml(data){
      var html = ""
                +"<td>"+data[0].c[0]+"</td><td>"+data[1]+"</td><td>"+data[2].c[0]+"</td><td>"+data[3].c[0]+"</td><td>"+data[4].c[0]+"</td>"
                +"<td>"+timeToFormatDate(data[5].c[0]*1000)+"</td><td>"+timeToFormatDate(data[6].c[0] * 1000)+"</td><td>"+data[7].c[0]+"</td>"
                +"<td>"+hexCharCodeToStr(data[8])+"</td>";
        return html;
  }