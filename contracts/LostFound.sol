// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LostFound {
    struct Item {
        string description;
        string location;
        string contact;
        bool isLost;
        address reporter;
    }

    Item[] public items;

    function reportItem(string memory _desc, string memory _loc, string memory _contact, bool _isLost) public {
        items.push(Item(_desc, _loc, _contact, _isLost, msg.sender));
    }

    function getTotalItems() public view returns (uint256) {
        return items.length;
    }
}