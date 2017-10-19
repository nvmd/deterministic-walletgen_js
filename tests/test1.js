var wg = require('../dist/walletgen.js');
// wg = require('../lib/deterministic_wallet.js');


console.log('Running DW');

var currencies = [ wg.moneroCurrency ];
console.log(currencies);
var dw = wg.DeterministicWalletPM10k.generate(currencies);
keys     = dw.accounts[0].keys;
mnemonic = dw.mnemonic(lang);
passphrase = dw.passphrase();

console.log(keys);
console.log(mnemonic);
console.log(passphrase);
