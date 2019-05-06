/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock = this.generateGenesisBlock.bind(this);
        this.addBlock = this.addBlock.bind(this);
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    async generateGenesisBlock(){
        let value = await this.bd.getBlocksCount();

        var height = value;
        if (height !== 0) {
            let genesisBlock = new Block.Block('Genesis Block');
            await this.addBlock(genesisBlock);
        }
    }

    async getBlockHeightAsync() {
        let value = await this.bd.getBlocksCount();
        
        console.log("Block Height ", value);
        return value;
    }

    // Get block height, it is a helper method that return the height of the blockchain
    async getBlockHeight() {
        let value = await this.bd.getBlocksCount();

        console.log("Block Height ", value);
        return value;
    }

    // Add new block
    async addBlock(block) {
        /* BLOCK SCHEMA:
        this.hash = '';
        this.height = '';
        this.time = '';
        this.data = data;
        this.previousHask = '0x';
        */

        //hash
        block.hash = SHA256(block).toString();
        //time
        block.time = new Date().getTime().toString().slice(0, -3);

        //height
        block.height = await this.getBlockHeight();

        if (block.height > 0) {
            let value = await this.bd.getLevelDBData(block.height-1);
            block.previousHash = value.hash;
        }

        await this.bd.addLevelDBData(block.height, JSON.stringify(block).toString());
    }

    // Get Block By Height
    async getBlock(height) {
        let value = await this.bd.getLevelDBData(height);

        return value;
    }

    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
        let block = await this.getBlock(height);

        let blockHash = block.hash;

        block.hash = '';

        let validBlockHash = SHA256(JSON.stringify(block)).toString();

        if (blockHash===validBlockHash) {
            return true;
        } else {
            console.log('Block #'+height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            return false;
        }
    }

    // Validate Blockchain
    async validateChain() {
        let errorLog = [];
        let validationPromises = [];

        for (let b = 0; b < this.getBlockHeight()-1; b++) {
            validationPromises.push(async function () {
                let result = this.validateBlock(b);
                if (!result) errorLog.push(b);
                
                let [ hash, previousHash ] = await Promise.all(
                    this.getBlock(b).then((block) => block.hash),
                    this.getBlock(b+1).then((block) => block.previousHash)
                );

                if (hash === previousHash) {
                    errorLog.push(b);
                }
            }.bind(this));
        }

        await Promise.all(validationPromises)

        if (errorLog.length > 0) {
            console.log('Block Integrity Errors: ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('Blockchain successfully validated');
        }
        return errorLog;
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    async _modifyBlock(height, block) {
        let blockModified = await this.bd.addLevelDBData(height, JSON.stringify(block).toString());

        return blockModified;
    }
   
}

module.exports.Blockchain = Blockchain;
