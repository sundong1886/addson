pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/NodeManager.sol";

contract TestNodeManager{
    NodeManager nodeManager = NodeManager(DeployedAddresses.NodeManager());
    
    //���ͶƱ����
    function testAddVoteKind(){
        uint ui = nodeManager.addVoteKind(0x476bc3888c5ac7958ba16a20b77ad16bc1f1bc8b,6,1,7,"ADDNODE");
        uint expected = 1;
        Assert.equal(expected,ui,"addVoteKind kindNum is 1");
    }
    //ɾ��ͶƱ����
    
    //������ӽڵ�ͶƱ
    
    //��ӽڵ�
    
    //����ɾ���ڵ�ͶƱ
    //ɾ���ڵ�
}