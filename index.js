const axios = require("axios");
const fs = require("fs");
const path = require("path");

const URL = "https://api.hive-engine.com/rpc/contracts";
const CONTRACT = "nft"; // Should be nft
const TABLE_POSTFIX = "instances"; // Should be the same
const NFT_SYMBOL = "HKFARM"; // Your NFT Symbol
const EXPORT = true; // Export to file? true = Export, false = no

// Return true to count, false to ignore
function limiter(nft) {
    return nft.properties.TYPE.toLowerCase() ===  "plot";
}

// Change grouping
function grouper(nft) {
    return nft.properties.NAME;
}

async function axiosRequest({contract, table, query, offset}) {
    // Headers
    let config = {headers: {"Content-Type": "application/json", "Cache-Control": "no-cache"}};
    // Request POST body data
    let body = JSON.stringify([{"method": "find", "jsonrpc": "2.0", "params": {"contract":  contract, "table":  table, "query": query, "limit": 1000, "offset": offset, "indexes" : []},  "id" : 1}]);
    // Make request.
    return await axios.post(URL, body, config);
}

function isNullOrEmpty(variable) {
    return (variable === null || variable === undefined);
}

async function queryContract({contract,table,query={}},offset=0) {
    // Request data
    let response = await axiosRequest({contract, table, query, offset});

    // Return result
    if (response && response.data !== undefined && response.data !== null && !isNullOrEmpty(response.data[0].result)) return response.data[0].result;

    // Else return false
    return false;
}

// Main code
(async function () {
    let complete = false;
    let nfts = [];
    let offset = 0;

    while (!complete) {
        let get_nfts = await queryContract({contract: CONTRACT, table: NFT_SYMBOL + TABLE_POSTFIX}, offset);
        if (get_nfts !== false) {
            nfts = nfts.concat(get_nfts);
            offset += 1000;

            if (get_nfts.length !== 1000) {
                complete = true;
            }
        } else {
            complete = true;
        }
    }

    let owners = {};

    for (let i = 0; i < nfts.length; i++) {
        if(limiter(nfts[i])) {
            if (owners.hasOwnProperty(nfts[i].account)) {
                owners[nfts[i].account].total += 1;
                if (owners[nfts[i].account].hasOwnProperty(grouper(nfts[i]))) {
                    owners[nfts[i].account][grouper(nfts[i])] += 1;
                } else {
                    owners[nfts[i].account][grouper(nfts[i])] = 1;
                }
            } else {
                owners[nfts[i].account] = {"total": 1};
                owners[nfts[i].account][grouper(nfts[i])] = 1;
            }
        }
    }

    console.log(owners);
    if (EXPORT) {
        fs.writeFileSync(path.join(__dirname, "export.json"), JSON.stringify(owners));
    }
})();