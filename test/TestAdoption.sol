pragma solidity ^0.4.17;

import "truffle/Assert.sol";   // ����Ķ���
import "truffle/DeployedAddresses.sol";  // ������ȡ�����Ժ�Լ�ĵ�ַ
import "../contracts/Adoption.sol";      // �����Ժ�Լ

contract TestAdoption {
  Adoption adoption = Adoption(DeployedAddresses.Adoption());

  // ������������
  function testUserCanAdoptPet() public {
    uint returnedId = adoption.adopt(8);

    uint expected = 8;
    Assert.equal(returnedId, expected, "Adoption of pet ID 8 should be recorded.");
  }

  // ���������߲�������
  function testGetAdopterAddressByPetId() public {
    // ���������ߵĵ�ַ���Ǳ���Լ��ַ����Ϊ�������ɲ��Ժ�Լ�����ף�
    address expected = this;
    address adopter = adoption.adopters(8);
    Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded.");
  }

    // ��������������
  function testGetAdopterAddressByPetIdInArray() public {
  // �����ߵĵ�ַ���Ǳ���Լ��ַ
    address expected = this;
    address[16] memory adopters = adoption.getAdopters();
    Assert.equal(adopters[8], expected, "Owner of pet ID 8 should be recorded.");
  }
}