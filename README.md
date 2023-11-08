# A simple Electron app that:

  - Connects to a socks5 proxy server.
  - Establishes WebSocket connection.
  - Calls an external API to fetch random facts.

# How to use it:

    npm install

  Make sure you have a NR running locally in open-proxy mode. Refer to docs to set this up https://nymtech.net/docs/nodes/network-requester.html
  Make sure you have a SOCKS5 proxy server running locally on 127.0.0.1:1080, in open proxy mode. Refer to the docs if you haven'y done this before https://nymtech.net/docs/clients/socks5-client.html 
  
  Once you have that running, do:
    
    npm start

# Info #

  The app checks if the socks5 proxy server is reachable before starting. 
  
  Depending on the result of that check it will either display an error message, or, if the proxy is reachable, it will launch the Electron app.
  
  Once launched, it establishes a WebSocket server connection on port 8080 via a WebSocket client on port 1080.
  
  The second step of the socks5 WebSocket app test is calling an external API from within the app. 
  
  So, when you click the "Fetch Random Fact" button, it makes an HTTP request to an external API using the SOCKS5 proxy. 
  
  The result will only be displayed to screen if the socks5 connection is running, otherwise, an error will be thrown.
