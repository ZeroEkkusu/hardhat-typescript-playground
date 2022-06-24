//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
  error Raffle__NotEnoughETHEntered();
  error Raffle__TransferFailed();
  error Raffle__NotOpen();
  error Raffle_UpkeepNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
  );

  event RaffleEnter(address indexed player);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winnner);

  enum RaffleState {
    OPEN,
    CALCULATING
  }

  uint16 internal constant REQUEST_CONFIRMATIONS = 3; // doesn't matter here
  uint32 internal constant NUM_WORDS = 1;

  uint256 internal immutable entranceFee;
  VRFCoordinatorV2Interface internal immutable vrfCoordinator;
  bytes32 internal immutable keyHash;
  uint64 internal immutable subscriptionId;
  uint32 internal immutable callbackGasLimit;
  uint256 internal immutable interval;

  address payable[] internal players;
  address internal recentWinner;
  RaffleState internal raffleState;
  uint256 internal lastTimeStamp;

  constructor(
    address vrfCoordinatorV2,
    uint256 _entranceFee,
    bytes32 _keyHash,
    uint64 _subscriptionId,
    uint32 _callbackGasLimit,
    uint256 _interval
  ) payable VRFConsumerBaseV2(vrfCoordinatorV2) {
    vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    entranceFee = _entranceFee;
    keyHash = _keyHash;
    subscriptionId = _subscriptionId;
    callbackGasLimit = _callbackGasLimit;
    raffleState = RaffleState.OPEN;
    lastTimeStamp = block.timestamp;
    interval = _interval;
  }

  function enterRaffle() external payable {
    if (msg.value < entranceFee) revert Raffle__NotEnoughETHEntered();
    if (raffleState != RaffleState.OPEN) revert Raffle__NotOpen();

    players.push(payable(msg.sender));
    emit RaffleEnter(msg.sender);
  }

  function checkUpkeep(
    bytes memory /*checkData*/
  )
    public
    returns (
      bool upkeepNeeded,
      bytes memory /*performData*/
    )
  {
    // 1 day has passed
    // At least 1 player and some ETH
    // Sufficient subscription funds
    // The lottery should be waiting for the result
    bool isOpen = raffleState == RaffleState.OPEN;
    bool timePassed = (block.timestamp - lastTimeStamp) > interval;
    bool hasPlayers = players.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
  }

  function performUpkeep(
    bytes calldata /*performData*/
  ) external {
    (bool upkeepNeeded, ) = checkUpkeep("");
    if (!upkeepNeeded)
      revert Raffle_UpkeepNeeded(
        address(this).balance,
        players.length,
        uint256(raffleState)
      );

    raffleState = RaffleState.CALCULATING;

    uint256 requestId = vrfCoordinator.requestRandomWords(
      keyHash,
      subscriptionId,
      REQUEST_CONFIRMATIONS,
      callbackGasLimit,
      NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);
  }

  function fulfillRandomWords(
    uint256, /*requestId*/
    uint256[] memory randomWords
  ) internal override {
    uint256 indexOfWinner = randomWords[0] % players.length;
    address payable _recentWinner = players[indexOfWinner];
    recentWinner = _recentWinner;
    players = new address payable[](0);
    lastTimeStamp = block.timestamp;
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    if (!success) {
      revert Raffle__TransferFailed();
    }
    emit WinnerPicked(_recentWinner);

    raffleState = RaffleState.OPEN;
  }

  function getEntranceFee() external view returns (uint256) {
    return entranceFee;
  }

  function getPlayer(uint256 index) external view returns (address) {
    return players[index];
  }

  function getRecentWinner() external view returns (address) {
    return recentWinner;
  }

  function getRaffleState() external view returns (RaffleState) {
    return raffleState;
  }

  function getNumWords() external pure returns (uint256) {
    return NUM_WORDS;
  }

  function getNumPlayers() external view returns (uint256) {
    return players.length;
  }

  function getLatestTimestamp() external view returns (uint256) {
    return lastTimeStamp;
  }

  function getRequestConfirmations() external pure returns (uint256) {
    return REQUEST_CONFIRMATIONS;
  }
}
