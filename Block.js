/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		// Add your Block properties
		// Example: this.hash = "";
		this.hash = '';
		this.height = '';
		this.time = '';
		this.data = data;
		this.previousHask = '0x';
	}
}

module.exports.Block = Block;