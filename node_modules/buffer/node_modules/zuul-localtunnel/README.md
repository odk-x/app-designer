# zuul-localtunnel

Used in Zuul by default as a tunnel service to expose yourself to the world, so you can run your tests in say Saucelabs or Browserstack. Used for built in Saucelabs support as well.

To enable tunneling with localtunnel you can simply do this (assuming your test folder is called `test`):

```
./node_modules/zuul/bin/zuul --tunnel --local -- test
```

You can also specify a tunnel host option via the `tunnel-host` switch:

```
./node_modules/zuul/bin/zuul --tunnel --tunnel-host http://localtunnel.me --local -- test
```

Or as a config option:

zuul.yml
```
tunnel_host: http://localtunnel.me
```

You can also specify all of this in the `tunnel` config option:

zuul.yml
```
tunnel:
  type: localtunnel # Optional and unnecessary here
  host: http://localtunnel.me
```
