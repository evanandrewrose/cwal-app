To run in development mode (reloading when code changes):

# Dependencies:

## NPM & NodeJS
* https://nodejs.org/en/download/package-manager

## Rust
* https://rustup.rs/

## Tauri
```
cargo add tauri-cli
```

# Running it
```
$env:RUST_BACKTRACE=1; cargo tauri dev
```

# Releasing
To release:

```
cargo build --release
```

# Q & A

## Why is web security disabled in tauri.conf?

We make "cross-site" requests to localhost (the StarCraft web server). That is, from localhost:{our port} to localhost:{sc port}. The StarCraft web server is configured to require CORS and the tauri web view honors that request unless we disable CORS explicitly through that flag.

Alternative options are:

* Run a server that forwards requests to the StarCraft server, essentially a local no-cors proxy. Ensure the only way to use the proxy is to communciate with the StarCraft web api.
* Make the requests from the backend and expose a general API to the front-end.
  * Since we already have a nice JS API provided by bw-web-api, we'd be duplicating a lot of effort.

The primary risk of having CORS disabled is when you're allowing the user to explore the web (and malicious websites). This app shouldn't ever be used for general purpose browsing, so the risk is minimal.