// Generated by CoffeeScript 2.1.1
var currencies, lanes, prices, showBlock, showTx, stats, updatePrices, updateStats;

currencies = {
  btc: new BTC(),
  eth: new ETH(),
  ltc: new LTC(),
  xrb: new XRB()
};

prices = {};

lanes = {};

stats = {};

// render TX
showTx = function(currency, tx) {
  var fee, value;
  value = tx.amount * (prices[currency] || 1);
  fee = tx.fee * (prices[currency] || 1);
  lanes[currency].addMeteor({
    speed: fee ? 2 + 4 * Math.min(2, Math.log10(1 + fee)) / 2 : 6,
    hue: value ? 220 - 220 * Math.min(6, Math.log10(1 + value)) / 6 : 220,
    thickness: Math.max(5, Math.log10(1 + value) * 10),
    length: Math.min(3, Math.log10(1 + fee)) / 3 * 250,
    link: tx.link,
    donation: tx.donation
  });
  return updateStats(currency, value, fee);
};

// render block
showBlock = function(currency, block) {
  lanes[currency].addBlock(Math.min(250, block.count / 4));
  if (stats[currency] != null) {
    return stats[currency].count = Math.max(0, stats[currency].count - block.count);
  }
};

// get current price
updatePrices = function(currencies) {
  var currencyAPI;
  currencyAPI = 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=';
  $.get(currencyAPI + currencies.join(',').toUpperCase(), function(data) {
    var currency, price, results;
    if (data) {
      results = [];
      for (currency in data) {
        price = data[currency];
        currency = currency.toLowerCase();
        prices[currency] = Math.round(1 / price * 100) / 100;
        results.push($(`.${currency} .price`).text(prices[currency].toLocaleString(void 0, {
          style: 'currency',
          currency: 'USD'
        })));
      }
      return results;
    }
  });
  return setTimeout(updatePrices.bind(null, currencies), 10 * 1000);
};

// update stats for a currency, called whenever there is a new TX
// to do that, keep a log of the last 60 seconds of tx
updateStats = function(currency, value = 0, fee = 0) {
  var duration, feePerTx, i, last, timestamp, txPerSecond, valuePerTx;
  if (stats[currency] == null) {
    stats[currency] = {
      last: [],
      count: 0
    };
  }
  if (currency !== 'xrb') {
    // increase number of unverified TX
    stats[currency].count++;
  }
  // calculate stats for last 60s
  last = stats[currency].last;
  timestamp = new Date().getTime();
  last.push({timestamp, value, fee});
  i = last.length;
  while (i--) {
    if (timestamp - last[i].timestamp > 60 * 1000) {
      last.splice(i, 1);
    }
  }
  duration = Math.max(last[last.length - 1].timestamp - last[0].timestamp, 1) / 1000;
  txPerSecond = Math.round(last.length / duration * 10) / 10;
  //valuePerSecond = Math.round(stat.reduce(((a, b) -> a + b.value), 0) / duration)
  valuePerTx = Math.round(last.reduce((function(a, b) {
    return a + b.value;
  }), 0) / last.length);
  //feePerSecond = Math.round(stat.reduce(((a, b) -> a + b.fee), 0) / duration * 100)/100
  feePerTx = Math.round(last.reduce((function(a, b) {
    return a + b.fee;
  }), 0) / last.length * 100) / 100;
  return $(`.${currency} .stats`).text(`${txPerSecond.toLocaleString()} tx/s (${stats[currency].count} unconfirmed)\n${valuePerTx.toLocaleString(void 0, {
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currency: 'USD'
  })} value/tx\n${feePerTx.toLocaleString(void 0, {
    style: 'currency',
    currency: 'USD'
  })} fee/tx`);
};

// start everything
$(function() {
  updatePrices(Object.keys(currencies));
  $('.overlay').hide().on('click', function(e) {
    if ($(e.target).is('.overlay')) {
      return $(this).fadeOut();
    }
  });
  return $('.currencies > div').each(function() {
    var canvas, currency;
    currency = $(this).attr('class');
    if (currencies[currency] != null) {
      currencies[currency].start(showTx.bind(null, currency), showBlock.bind(null, currency));
      canvas = $('<canvas></canvas>');
      $('.' + currency).append(canvas);
      lanes[currency] = new CanvasRenderer(canvas.get(0));
      // donation links
      if (currencies[currency].donationAddress) {
        return $(this).find('.donate').on('click', () => {
          return $('.overlay').fadeToggle().find('.address').text(currencies[currency].donationAddress);
        });
      } else {
        return $(this).find('.donate').remove();
      }
    }
  });
});

//# sourceMappingURL=main.js.map
