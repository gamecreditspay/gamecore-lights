// Generated by CoffeeScript 2.2.0
var BTC;

BTC = class BTC {
  constructor() {
    this.ws = null;
    this.socketUrl = "wss://ws.blockchain.info/inv";
  }

  start(txCb, blockCb) {
    if (this.ws) {
      this.stop();
    }
    this.ws = new WebSocket(this.socketUrl);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        op: 'unconfirmed_sub'
      }));
      return this.ws.send(JSON.stringify({
        op: 'blocks_sub'
      }));
    };
    this.ws.onmessage = function({data}) {
      var fee, i, input, j, len, len1, output, ref, ref1, valIn, valOut;
      data = JSON.parse(data);
      if (data.op === 'utx') {
        fee = 0;
        valOut = 0;
        valIn = 0;
        ref = data.x.inputs;
        for (i = 0, len = ref.length; i < len; i++) {
          input = ref[i];
          valIn += input.prev_out.value / 100000000;
        }
        ref1 = data.x.out;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          output = ref1[j];
          valOut += output.value / 100000000;
        }
        fee = Math.max(valIn - valOut, 0);
        return typeof txCb === "function" ? txCb({
          amount: valOut,
          fee: fee,
          link: 'https://blockchain.info/tx/' + data.x.hash,
          recipients: data.x.out.map(function(out) {
            return [out.addr, out.value / 100000000];
          })
        }) : void 0;
      } else {
        return typeof blockCb === "function" ? blockCb(data.x) : void 0;
      }
    };
    return {
      stop: function() {
        this.ws.close();
        return this.ws = null;
      }
    };
  }

};

//# sourceMappingURL=btc.js.map