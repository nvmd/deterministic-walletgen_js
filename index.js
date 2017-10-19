walletgen = {
    biginteger : require('./lib/biginteger.js'),
    crc32 : require('./lib/crc32.js'),
    sha3 : require('./lib/sha3.js'),
    crypto : require('./lib/crypto.js'),
    cnbase58 : require('./lib/cnbase58.js'),
    cnutil : require('./lib/cnutil.js'),
    mnemonic: require('./lib/mnemonic.js'),
    walletgen : require('./lib/deterministic_wallet.js')
};

module.exports = walletgen;
