# he-nft-counter
Count NFTs of certain types owned by users on Hive-Engine

# Editing

Lines 8 - 14 are all you should need to edit for standard Hive-Engine:

```js
const NFT_SYMBOL = "HKFARM"; // Your NFT Symbol
const EXPORT = true; // Export to file? true = Export, false = no

// Return true to count, false to ignore
function limiter(nft) {
    return nft.properties.TYPE.toLowerCase() ===  "plot";
}
```

I've commented it so you should be able to tell what each thing does :D
