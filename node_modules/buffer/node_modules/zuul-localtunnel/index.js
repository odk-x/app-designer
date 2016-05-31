var lt = require('localtunnel');

function Tunnel(config) {
  if (!this instanceof Tunnel) {
    return new Tunnel(config);
  }

  var self = this;

  self.host = config.tunnel_host || (config.tunnel && config.tunnel.host) || 'http://localtunnel.me';
  self.tunnel = undefined;
}

Tunnel.prototype.connect = function(port, cb) {
  var self = this;

  lt(port, { host: self.host }, function(err, open_tunnel) {
    if (err) {
      cb(err);
      return;
    }

    var url = open_tunnel.url + '/__zuul';
    self.tunnel = open_tunnel;
    cb(null, url);
  });
};

Tunnel.prototype.close = function() {
  var self = this;

 if (self.tunnel) {
    self.tunnel.close();
  }
};

module.exports = Tunnel;
