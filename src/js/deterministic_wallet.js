var DeterministicWallet = function (_config) {

  this.generate = function (ccs) {
    var seedSource = { type:   'passphrase'
                     , string: mn_random(256) // 256 bits of randomness
                     };
    return DeterministicWalletEngine(_config, seedSource, ccs);
  };

  this.recover = function (source, ccs) {
    return DeterministicWalletEngine(_config, source, ccs);
  };

  return this;
}({ salt: "de1ea11e112394834"
  , iter: 10000
  });


var DeterministicWalletEngine = function (_config, _seedSource, _ccs) {

  function kdf(key, salt, iter) {
    var str = key + salt;
    // poor_mans_kdf
    var hex = cnBase58.bintohex(cnBase58.strtobin(str));
    for (var n = 0; n < iter; ++n) {
      hex = keccak_256(cnBase58.hextobin(hex));
    }
    return hex;
  };

  function generate_with_seed(cc, seed) {
    var keys;

    if (cc.family == 'cryptonote') {
      keys = cnUtil.create_address(cnUtil.sc_reduce32(seed));
    }

    return { ticker: cc.ticker
           , keys:   keys
           };
  };

  function extract_seed(source) {
    if (source.type == 'passphrase') {
      return source.string;
    } else if (source.type == 'mnemonic') {
      return mn_decode(source.string, source.language);
    }
  }

  var seed = extract_seed(_seedSource);
  var key  = kdf(seed, _config.salt, _config.iter);
  var currencies = _ccs;
  var accounts = currencies.map(function (cc) {
    return generate_with_seed(cc, key);
  });


  this.accounts = accounts;

  this.passphrase = function () {
    return seed;
  };

  this.mnemonic = function (language) {
    try {
      // NOTE: throws an exception in case the seed can't be word encoded
      return mn_encode(seed, language);
    } catch (e) {
      return "";
    }
  };

  return this;
};
