/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.get(key, (error, value) => {
                if(error){
                    if (error.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' failed get', error);
                        reject(error);
                    }
                }else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            // Add your code here, remember in Promises you need to resolve() or reject()
            console.log(key, value);
            self.db.put(key, value, function(error) {
                if (error) {
                    console.log('Block ' + key + ' failed data addition', error);
                    reject(error);
                }else{
                    resolve(value);
                }
            }); 
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let dataArray = [];
        return new Promise(function(resolve, reject){
            // Add your code here, remember in Promises you need to resolve() or reject()
            self.db.createReadStream()
            .on('data', function (data) {
                dataArray.push(data);
            })
            .on('error', function (error) {
                reject(error);
            })
            .on('close', function () {
                resolve(dataArray.length);
            });
        });
    }
        

}

module.exports.LevelSandbox = LevelSandbox;
