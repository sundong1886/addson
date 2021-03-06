pragma solidity ^0.4.19;

//随机数
contract Random{
   function rand() public view returns(uint256) {
        uint256 randomValue = uint256(keccak256(block.difficulty,now));
        return  randomValue;
    } 
} 

//基础合约,当前合约拥有者
contract OwnerContract{
    
    //当前合约拥有者
    address public owner;
    
    //记录转让合约拥有者
    event TransferOwner(address indexed _owner,address indexed _newOwner);
    
    function OwnerContract() internal {
        owner = msg.sender;
    }
    
    //只有当前的合约拥有者,才能进行操作
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    //判断新拥有者的地址是否合法
    modifier isAddress(address _addr){
        require(_addr != address(0));
        _;
    }
    
    //转让合约拥有者
    function transferOwner(address _newOwner) internal onlyOwner isAddress(_newOwner){
        //转让合约拥有者
        owner = _newOwner;
        //记录转让合约拥有者
        emit TransferOwner(msg.sender,_newOwner);
    }
}
contract VoteKindContract is OwnerContract{
    
    //投票的类型
    struct VoteKind{
        string name;//投票类型名称
        uint rate;//主题通过比率
        uint minTime;//默认的投票最短时间
        uint maxTime;//默认的投票最长时间
        uint call;//执行投票结果的方法标记
        uint del;//删除标记,0 false,1 true
    }
    
    VoteKind[] public voteKinds;
    
    //记录
    event AddVoteKind(uint _kind,string _name,uint _rate,uint _minTime,uint _maxTime,uint _call);
    event DeleteVoteKind(uint _kind,string _name);
    
    //是一个有效的投票类型
    modifier isVoteKind(uint _kind){
        require(voteKinds.length > _kind && voteKinds[_kind].del ==0);
        _;
    }
    
     //添加投票类型
    function addVoteKind(string _name,uint _rate,uint _minTime,uint _maxTime,uint _call) public onlyOwner returns(uint){
        voteKinds.push(VoteKind({name:_name,rate:_rate,minTime:_minTime,maxTime:_maxTime,call:_call,del:0}));
        emit AddVoteKind(voteKinds.length -1,_name,_rate,_minTime,_maxTime,_call);
        return voteKinds.length -1;

    }
    //删除投票类型
    function delVoteKind(uint _kind) public onlyOwner isVoteKind(_kind) returns(uint){
        if(voteKinds[_kind].del == 0){
            voteKinds[_kind].del = 1;
        }
        emit DeleteVoteKind(_kind,voteKinds[_kind].name);
        return _kind;
    }
    
    //取投票类型索引
    function getVoteKindIndex()public view returns(uint){
         return voteKinds.length;
    }
    
    //投票类型索引取投票类型
    function getVoteKind(uint _kind) public view returns(uint kind,string name,
                        uint rate,uint minTime, uint maxTime,uint call,uint status){
        VoteKind memory voteKind = voteKinds[_kind];                 
        kind = _kind;
        name = voteKind.name;
        rate = voteKind.rate;
        minTime = voteKind.minTime;
        maxTime = voteKind.maxTime;
        call = voteKind.call;
        status = voteKind.del;
    }
    
}


//投票合约接口
contract  VoteInterface{
    //判断投票是否结束
    function isVoteOver(uint _pin)public constant returns(bool);
    //取投票结果
    function voteResult(uint _pin,bytes32 _objectId, uint _call)public returns(bool,string);
}

//投票合约
contract VoteContract is VoteKindContract,VoteInterface{
    
    Random random = new Random();
    
    //已经投过票的列表
    //投票主题 => 投票人账户列表
    mapping(uint => address[]) public voters;
    
    //定义投票主题的结构
    struct Proposal{
        string name ;  //投票主题的名字
        //uint pin; //投票主题编号,自动生成并返回
        uint kindNum;//投票的类型的序号
        uint yesVoteCount; //赞成票数
        uint noVoteCount;//反对票数
        uint voteStart; //投票开始时间
        uint voteEnd; //投票结束日期
        uint del;//投票是否完,0没有完
        //在发起投票时,要指定一个id,
        bytes32 objectId;//关联的项目id
    }
    
    //已经创建的投票主题
    //proposalPins 为pin号对应数组下标加1,
    //加1是因为,mapping的空key的值为0;
    //mapping(uint =>uint) public proposalPins;
    Proposal[] public proposals;
    
    //记录发起投票
    //发起人,要投票的项目,开始时间,结束时间
    event PublishVote(address indexed _chairperson,uint indexed _index,string _pName
                        ,bytes32 _objectId,uint _kind,uint _start,uint _end);
    //记录投票
    event Vote(address indexed _sender, bytes32 _objectId,uint indexed _pin,bool _approve);
    
    
    //是否对某个主题已经投过票
    modifier noVoted(uint _index){
        //取出所有的node,
        address[] memory nodes = voters[_index];
        bool flag = false;
        for(uint i = 0;i < nodes.length;i++){
            if(nodes[i] == msg.sender){
                flag = true;
                break;
            }
        }
        require(!flag);
        _;
    }
  
    //检查投票已经结束
    modifier isOver(uint _index){
        require(proposals.length > _index);
        require(now > proposals[_index].voteEnd);
        _;
    }
    
    //发起一个投票
    //主题地址,主题名称,
    function createVote(string _pName,bytes32 _objectId,uint _kind,uint _voteTime) internal isVoteKind(_kind) returns(uint){
        //取出投票的类型
        VoteKind memory voteKind = voteKinds[_kind];
        //如果投票时长设置过小,则取默认最小
        if(_voteTime < voteKind.minTime){
            _voteTime = voteKind.minTime;
        }
        //如果投票时长设置过大,则取默认最大
        if(_voteTime > voteKind.maxTime){
            _voteTime = voteKind.maxTime;
        }
        //初始化投票的主题
        //主题编号,账户名,投票类型序号,取得的票数,开始时间,结束时间
        //uint pin = random.rand();
        //while(proposalPins[pin] != 0){
            //pin = random.rand();
        //}
        //uint time = _voteTime * 60 * 60 * 24;
        uint time = _voteTime * 60;
        proposals.push(Proposal({name:_pName,kindNum:_kind,yesVoteCount:0,noVoteCount:0,
                                             voteStart:now,voteEnd:now + time,del:0,objectId:_objectId}));
                                             
        //proposalPins[pin] = proposals.length;
        emit PublishVote(msg.sender,proposals.length -1,_pName,_objectId,_kind,now,now +time);
        return proposals.length -1;
    }
    
    
    //投票
    //投票条件:
    //1,投票还没结束
    //2,投票者,在node列表中
    //3,投票者,没有投过票
    function vote(uint _index,uint _approve) internal noVoted(_index) returns(bool){
        
        //uint pin = _pin;
        //检查是一个有效的投票主题
        require(proposals.length > _index);
        //uint index = proposalPins[pin] -1;
        require(proposals[_index].del == 0);
        //检查投票没有结束
        require(now < proposals[_index].voteEnd);
        //根据_pin找到,具体的投票主题
        //投票
        bool flag = false;
        
        if(_approve == 0){
            //把当前用户的投票权重给予反对票
            proposals[_index].noVoteCount ++; 
            flag = true;
        }else{
            //把当前用户的投票权重给予赞成票
            proposals[_index].yesVoteCount ++; 
            flag = true;
        }
        //记录此账户已经投票
        if(flag){
            bool approve = _approve == 0;
            voters[_index].push(msg.sender);
            emit Vote(msg.sender,proposals[_index].objectId,_index,approve);    
        }
        return flag;
    }
    
    //查看投票是否结束
    function isVoteOver(uint _pin)public view returns(bool){
        return now > proposals[_pin].voteEnd;
    }
    
    //取投票结果
    function voteResult(uint _index,bytes32 _objectId,uint _call) public isOver(_index) returns(bool,string){

        uint kindNum = proposals[_index].kindNum;
        //是否能过,基准比率
        uint rate = voteKinds[kindNum].rate;
        //判断类型是否有效,并且相符
        require(voteKinds[kindNum].del ==0 && voteKinds[kindNum].call == _call);
        //判断aid;
        require(proposals[_index].objectId == _objectId);
        //只能取一次
        require(proposals[_index].del == 0);
        proposals[_index].del = 1;
        //赞成票数
        uint yesVote = proposals[_index].yesVoteCount;
        //反对票数
        uint noVote = proposals[_index].noVoteCount;
        
        //计算通过率 = 赞成票数/参与投票的人数
        uint voteRate = yesVote / (yesVote + noVote) *100;
        return (rate <= voteRate,proposals[_index].name);
    }
    
    //取投票索引
    function getVoteIndex() public view returns(uint index){
        index = proposals.length;
    }
    
    //取投票详情
    // function getVoteInfoByPin(uint _pin) public view returns(uint index,uint pin,string name,uint kindNum,
    //             uint yesVoteCount,uint noVoteCount,uint voteStart,uint voteEnd,uint status,bytes32 objectId){
        
    //     uint _index = proposalPins[_pin] -1;
        
    //     return getVoteInfoByIndex(_index);
        
    // }
    
    function getVoteInfoByIndex(uint _index) public view returns(uint index,string name,uint kindNum,
                uint yesVoteCount,uint noVoteCount,uint voteStart,uint voteEnd,uint status,bytes32 objectId){
        Proposal memory proposal = proposals[_index];
        index = _index;
        //pin = proposal.pin;
        name = proposal.name;
        kindNum = proposal.kindNum;
        yesVoteCount = proposal.yesVoteCount;
        noVoteCount = proposal.noVoteCount;
        voteStart = proposal.voteStart;
        voteEnd = proposal.voteEnd;
        status = proposal.del;
        objectId = proposal.objectId;
    }
}

//节点合约
contract NodeManager is VoteContract{

    //节点结构
    struct NodeStruct{
        bytes32 id;//唯一标识
        address addr;//账户地址
        string name;//节点名称
        uint del;//删除标记,0表示未删除
    }
    
    //节点列表
    //逻辑删除
    //节点地址 => 节点索引 加 1
    mapping(bytes32 => uint) public nodes;
    NodeStruct[] public nodeEntities;
    
    event AddNode(bytes32 indexed _objectId,string _name);
    event DeleteNode(bytes32 indexed _objectId,string _name);
    
    //判断是否是已存在的节点
    modifier isNode(bytes32 _nodeId){
        require(nodes[_nodeId] != 0);
        _;
    }
    modifier isNotNode(bytes32 _node){
        require(nodes[_node] == 0);
        _;
    }
    
    //构造器
    function NodeManager()public{
        //添加投票类型
        addVoteKind("ADD NODE",60,1,7,100);
        addVoteKind("DELETE NODE",60,1,7,101);
        //添加一个节点
        bytes32 _objectId = "000000";
        string memory name = "number one";
        nodeEntities.push(NodeStruct({id:_objectId,addr:msg.sender,name:name,del:0}));
        nodes[_objectId] = nodeEntities.length;
        emit AddNode(_objectId,name);
    }

    
    //添加节点
    function addNode(uint _pIndex,bytes32 _objectId,address _node) public isNotNode(_objectId) returns(bool){
        //调用投票的合约结果
        //判断类型是否相符
        if(isVoteOver(_pIndex)){
            bool result;
            string memory name;
            (result, name) = voteResult(_pIndex,_objectId,100);
            if(result){
                //如果节点之前存在过,则修改状态以恢复节点
                if(nodes[_objectId] != 0){
                    uint index = nodes[_objectId] -1;
                    if(nodeEntities[index].del != 0){
                        nodeEntities[index].del == 0;
                    }
                    return true;
                }else{
                    //执行操作
                    nodeEntities.push(NodeStruct({id:_objectId,addr:_node,name:name,del:0}));
                    nodes[_objectId] = nodeEntities.length;
                    emit AddNode(_objectId,name);
                    return true;
                }
                return false;
            }
        }
        return false;
    }
    
    //删除节点
    function delNode(uint _pIndex,bytes32 _objectId) public isNode(_objectId){
        //调用投票的合约结果
        //判断类型是否相符
        if(isVoteOver(_pIndex)){
            bool result;
            string memory name;
            (result, name) = voteResult(_pIndex,_objectId,101);
            if(result){
                //执行操作
                uint index = nodes[_objectId] -1;
                nodeEntities[index].del = 1;
                emit DeleteNode(_objectId,name);
            }
        }
    }
    
    //创建一个投票
    function publishVote(bytes32 _nodeId,string _pName,bytes32 _objectId,uint _kind,uint _voteTime) public isNode(_nodeId) returns(uint){
        uint index = nodes[_nodeId] -1;
        require(nodeEntities[index].addr == msg.sender);
        return createVote(_pName,_objectId,_kind,_voteTime);
    }
    //投票
    function voting(bytes32 _nodeId,uint _pin,uint _approve) public isNode(_nodeId) returns(bool){
        uint index = nodes[_nodeId] -1;
        require(nodeEntities[index].addr == msg.sender);
        return vote(_pin,_approve);
    }
    //取节点索引
    function getNodeIndex() public view returns(uint){
        return nodeEntities.length;
    }
    //取节点信息
    function getNodeInfoByIndex(uint _index)public view returns(bytes32 id,address addr,string name,uint status){
        NodeStruct memory node = nodeEntities[_index];
        id = node.id;
        addr = node.addr;
        name = node.name;
        status = node.del;
    }
}