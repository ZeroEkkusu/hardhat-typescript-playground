// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.7;

contract BasicNft is ERC721 {
    uint256 private tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Dogie", "DOG") {}

    function mintNft() external returns (uint256 tokenId) {
        tokenId = tokenCounter;
        _safeMint(msg.sender, tokenCounter);
        ++tokenCounter;
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return TOKEN_URI;
    }

    function getTokenCounter() external view returns (uint256) {
        return tokenCounter;
    }
}
