// Middleware to extract the client's IP address

    try {
        let clientIp = req.headers['x-forwarded-for'] ||  req.socket.remoteAddress;
        // Handle IPv6-mapped IPv4 addresses
        if (clientIp.startsWith('::ffff:')) {
          clientIp = clientIp.split(':').pop();
        }
        req.clientIp = clientIp;
        next();
    } catch (error) {
      next(error);
    }
 