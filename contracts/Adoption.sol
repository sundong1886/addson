pragma solidity ^0.4.19;

contract Adoption {

  address[16] public adopters;  // ���������ߵĵ�ַ

    // ��������
  function adopt(uint petId) public returns (uint) {
    require(petId >= 0 && petId <= 15);  // ȷ��id�����鳤����

    adopters[petId] = msg.sender;        // ����������ַ 
    return petId;
  }

  // ����������
  function getAdopters() public view returns (address[16]) {
    return adopters;
  }

}