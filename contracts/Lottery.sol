// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Lottery is VRFConsumerBaseV2{
    address public manager;
    uint256 deadline;
    address[] public players;
    uint256 private constant ROLL_IN_PROGRESS = 42;
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;
    bytes32 s_keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint32 callbackGasLimit = 40000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    address s_owner;
    mapping(uint256 => address) private s_rollers;
    mapping(address => uint256) private s_results;
    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);

    modifier restricted(){
        require(msg.sender==manager);
        _;
    }

    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        manager=msg.sender;
        deadline=block.timestamp + 60 minutes;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function EnterLottery() public payable{
        require(msg.value==0.1 ether);   //100000000000000000 wei
        require(block.timestamp <= deadline);

        players.push(msg.sender);

    }

    function rollDice(address roller) public restricted returns (uint256 requestId) {
        require(s_results[roller] == 0, 'Already rolled');
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_rollers[requestId] = roller;
        s_results[roller] = ROLL_IN_PROGRESS;
        emit DiceRolled(requestId, roller);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 d20Value = (randomWords[0] % 20) + 1;
        s_results[s_rollers[requestId]] = d20Value;
        emit DiceLanded(requestId, d20Value);
    }

    function house(address player) public returns (address ) {
        require(s_results[player] != 0, 'Dice not rolled');
        require(s_results[player] != ROLL_IN_PROGRESS, 'Roll in progress');
        payable(players[s_results[player] - 1]).transfer(address (this).balance);
        players = new address[](0);
        return  players[s_results[player] - 1];
    }

    function getPlayers() public view returns (address[]){
        return players;
    }
}
