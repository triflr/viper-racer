pragma solidity ^0.8.0;

import "./ViperVerifierI.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Racer is Ownable {
    uint256 public furthestDistance;
    address public fastestPlayer;
    uint256 public costToPlay = 0.0 ether;

    uint256 public constant maxHeight = 1000;

    uint256 public startingX = 0;
    uint256 public startingY = maxHeight / 2;
    uint256 public startingAngle = 0;

    mapping(address => uint256) public plays;
    address public verifier;

    constructor() {}

    function commitToRace() public payable {
        require(msg.value == costToPlay, "Must pay to play");
        plays[msg.sender] = block.number;
    }

    function forfeit() public {
        delete plays[msg.sender];
    }

    function resolveRace(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[7] memory input
    ) public {
        uint playBlock = plays[msg.sender];
        if (playBlock > 256) {
            forfeit();
            return;
        }
        bytes32 hash = blockhash(playBlock);
        require(
            uint(uint128(uint256(hash))) == input[0],
            "Playing with wrong hash"
        );
        require(
            uint(uint128(uint160(msg.sender))) == input[1],
            "Playing with wrong address"
        );
        require(uint(startingX) == input[2], "Playing with wrong startingX");
        require(uint(startingY) == input[3], "Playing with wrong startingY");
        require(
            uint(startingAngle) == input[4],
            "Playing with wrong startingAngle"
        );
        require(verifyProof(a, b, c, input), "Invalid proof");

        uint256 distanceX = input[5];
        if (distanceX > furthestDistance) {
            furthestDistance = distanceX;
            fastestPlayer = msg.sender;
            uint256 amount = address(this).balance;
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "failed to payout");
        }
    }

    function setVerifier(address verifier_) public onlyOwner {
        verifier = verifier_;
    }

    function setCostToPlay(uint256 costToPlay_) public onlyOwner {
        costToPlay = costToPlay_;
    }

    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[7] memory input
    ) internal view returns (bool) {
        return true;
        // return IVerifier(verifier).verifyProof(a, b, c, input);
    }
}
