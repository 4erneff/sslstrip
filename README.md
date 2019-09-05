# SSLstrip
This is a project for the Network security 2 course @FMI (https://github.com/hackman/netsec2)

The idea is to implement a simple ssl stripper proxy service that uses man in the middle attack to intercept the traffic between the victim and the server and replace the secured SSL(https) connection with an unsecured one(over http). From then on the client sends all the requests in plain text which allows the proxy service to log sensitive data like passwords, credit card ids ect.

# Prerequisites

In order to perform MITM attack and run sslstrip you need to have the following tools installed

1. Nodejs 10
2. iptables
3. ettercap

SSLstrip uses only standart libs so no `npm install` is needed

# Run instruction

1. Run setup.sh script as root (to perform MITM attack and redirect traffic to port 8080)
2. npm start --port=8080 (have in mind that the default port would be 8001)
3. Go sniffing!

# How it works

SSLstrip uses http module to create new proxy server and start it. When the victim opens new website the requests is routed to the proxy server instead of the router. `handle` method is called when new request arrives. It constructs and sends new request to the real application server containing all the headers from the original one and the same body. The requests that proxy server does are always over HTTPS. When we have the response from the application server, the proxy server strips the SSL information and returns the response to the victim.
That way, from the victim's browser perspective the application server does not support SSL and from then on all the requests are sent in plain text. What the browser is not aware of is the fact that it does not communicate with the application server but the proxy server which sniffs all the requests and loggs them.


