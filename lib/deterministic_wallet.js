var CryptoNoteFamily = function (ccConfig) {

  this.create_address = function (seed) {
    var tools = cnUtil({ coinUnitPlaces: ccConfig.units
                       , addressPrefix:  ccConfig.addressPrefix
                       });
    return tools.create_address(tools.sc_reduce32(seed));
  };

  return this;
};

var BitcoinFamily = function (ccConfig) {

  this.create_address = function (seed) {
    return null;
  };

  return this;
};


var DeterministicWallet = function (_config) {

  function entropy_source (config) {
    if (config.entropy == undefined) {
      return mn_random;
    } else {
      return config.entropy;
    }
  };


  // Public API

  this.generate = function (ccs) {
    var seedSource = { type:   'passphrase'
                     , string: entropy_source(_config)(256) // 256 bits of randomness
                     };
    return DeterministicWalletEngine(_config, seedSource, ccs);
  };

  this.recover = function (source, ccs) {
    return DeterministicWalletEngine(_config, source, ccs);
  };

  return this;
};

var DeterministicWalletEngine = function (_config, _seedSource, _ccs) {

  function poor_mans_kdf(key, salt, iter) {
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

    var ccFamily = currencyFamilies[cc.family];
    if (ccFamily != undefined) {
      keys = ccFamily(cc.params).create_address(seed);
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
  };

  function extract_kdf(config) {
    if (config.kdf == undefined) {
      return poor_mans_kdf;
    } else {
      return config.kdf;
    }
  };

  // setup engine's state
  var seed = extract_seed(_seedSource);
  var kdf  = extract_kdf(_config);
  var key  = kdf(seed, _config.salt, _config.iter);
  var currencies       = _ccs;
  var currencyFamilies = _config.families;
  var accounts = currencies.map(function (cc) {
    return generate_with_seed(cc, key);
  });
  // end setup


  // Public API

  this.accounts = accounts;

  this.passphrase = function () {
    return seed;
  };

  this.mnemonic = function (language) {
    try {
      // NOTE: throws an exception in case the seed can't be word encoded
      return mn_encode(seed, language);
    } catch (e) {
      return "<i><b>Error: Not representable as mnemonic</b></i>";
    }
  };

  return this;
};

var DeterministicWalletPM10k = DeterministicWallet({
    salt: "de1ea11e112394834"
  , iter: 10000
  , families: { 'cryptonote': CryptoNoteFamily
              , 'bitcoin':    BitcoinFamily
              }
  // KDF and Entropy source can also be set here,
  // otherwise, defaults will be used
  // , kdf: function(key, salt, iter) {
  //     // ...
  //     return hex;
  //   }
  // , entropy: function(numberOfBits) {
  //     // ...
  //     return hex;
  //   }
  });

var moneroCurrency = { ticker: 'xmr'
                     , name: 'monero'
                     , family: 'cryptonote'
                     , uriPrefix: 'monero:'
                     , params: { units: 12
                               , addressPrefix: 18
                               }
                     };
var digitalNoteCurrency = { ticker: 'xdn'
                          , name: 'digitalnote'
                          , family: 'cryptonote'
                          , uriPrefix: 'digitalnote:'
                          , params: { units: 8
                                    , addressPrefix: 219  // 0xDB
                                    }
                          };


exports.DeterministicWalletPM10k = DeterministicWalletPM10k;
exports.DeterministicWallet = DeterministicWallet;

exports.BitcoinFamily = BitcoinFamily;
exports.CryptoNoteFamily = CryptoNoteFamily;

exports.moneroCurrency = moneroCurrency;
exports.digitalNoteCurrency = digitalNoteCurrency;
