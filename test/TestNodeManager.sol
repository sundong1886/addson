pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/NodeManager.sol";

contract TestNodeManager{
    NodeManager nodeManager = NodeManager(DeployedAddresses.NodeManager());
    
    //添加投票类型
    function testAddVoteKind(){
        uint ui = nodeManager.addVoteKind(0x476bc3888c5ac7958ba16a20b77ad16bc1f1bc8b,6,1,7,"ADDNODE");
        uint expected = 1;
        Assert.equal(expected,ui,"addVoteKind kindNum is 1");
    }
    //删除投票类型
    
    //发起添加节点投票
    
    //添加节点
    
    //发起删除节点投票
    //删除节点
}