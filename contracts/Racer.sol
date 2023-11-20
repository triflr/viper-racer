pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ViperMainVerifier.sol";
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

    function convertHash(bytes32 hash) public pure returns (uint) {
        return uint(uint128(uint256(hash)));
    }

    function convertAddress(address addr) public pure returns (uint) {
        return uint(uint128(uint160(addr)));
    }

    function resolveRace(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[7] memory input
    ) public {
        uint playBlock = plays[msg.sender];
        if (block.number - playBlock > 256) {
            // maybe should revert
            forfeit();
            return;
        }
        require(verifyProof(a, b, c, input), "Invalid proof");

        uint out_x = input[0];
        // uint out_y = input[1];
        uint in_hash = input[2];
        uint in_addr = input[3];
        uint in_x = input[4];
        uint in_y = input[5];
        uint in_ang = input[6];

        console.log(uint(startingX));
        console.log(in_x);
        require(uint(startingX) == in_x, "Playing with wrong startingX");
        require(uint(startingY) == in_y, "Playing with wrong startingY");
        require(
            uint(startingAngle) == in_ang,
            "Playing with wrong startingAngle"
        );

        bytes32 thisPlayHash = blockhash(playBlock);
        require(
            convertHash(thisPlayHash) == in_hash,
            "Playing with wrong hash"
        );
        require(
            convertAddress(msg.sender) == in_addr,
            "Playing with wrong address"
        );

        if (out_x > furthestDistance) {
            furthestDistance = out_x;
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
        return Groth16Verifier(verifier).verifyProof(a, b, c, input);
    }
}
