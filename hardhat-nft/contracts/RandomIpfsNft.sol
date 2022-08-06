// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.7;

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    error RandomIpfsNft__RangeOutOfBounds();
    error RandomIpfsNft__NeedMoreEth();
    error RandomIpfsNft__TransferFailed();

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    VRFCoordinatorV2Interface private immutable vrfCoordinator;
    uint64 private immutable subscriptionId;
    bytes32 private immutable keyHash;
    uint32 private immutable callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) public requestIdToSender;

    uint256 internal tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal dogTokenUris;
    uint256 internal mintFee;

    constructor(
        address vrfCoordinatorV2,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        string[3] memory _dogTokenUris,
        uint256 _mintFee
    ) ERC721("Random IPFS NFT", "RIN") VRFConsumerBaseV2(vrfCoordinatorV2) {
        vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        dogTokenUris = _dogTokenUris;
        mintFee = _mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value != mintFee) revert RandomIpfsNft__NeedMoreEth();
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );
        requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address dogOwner = requestIdToSender[requestId];
        uint256 newTokenId = tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        _safeMint(dogOwner, newTokenId);
        _setTokenURI(newTokenId, dogTokenUris[uint256(dogBreed)]);
        ++tokenCounter;
        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() external payable onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng)
        public
        pure
        returns (Breed)
    {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        uint256 length = chanceArray.length;
        for (uint256 i; i < length; ++i) {
            if (
                moddedRng >= cumulativeSum &&
                moddedRng < cumulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
        // 10% PUG
        // 20% SHIBA INU
        // 60% ST. BERNARD
    }

    function getMintFee() public view returns (uint256) {
        return mintFee;
    }

    function getDogTokenUri(uint256 index) public view returns (string memory) {
        return dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }
}
