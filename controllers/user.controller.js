import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const clientInfo = async (req, res, next) => {
    const visitorName = req.query.visitor_name;

    if (!visitorName) {
        return res.status(400).json({ error: 'Visitor name is required' });
    }

    let clientIp;

    try {
        // Extract IP address
        clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Handle IPv6-mapped IPv4 addresses
        if (clientIp.startsWith('::ffff:')) {
            clientIp = clientIp.split(':').pop();
        }

        req.clientIp = clientIp;
        next();
    } catch (error) {
        return next(error);
    }

    console.log(clientIp);

    let city;

    try {
        // First try to get location information from ipapi using the extracted client IP
        const ipapiResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
        if (ipapiResponse.data.error) {
            throw new Error(ipapiResponse.data.reason);
        }
        city = ipapiResponse.data.city;
    } catch (error) {
        console.error(`ipapi failed: ${error.message}. Trying ip-api.com...`);
        // If ipapi fails, fallback to ip-api.com
        const ipApiResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        if (ipApiResponse.data.status !== 'success') {
            throw new Error(ipApiResponse.data.message);
        }
        city = ipApiResponse.data.city;
    }

    console.log(`Client IP: ${clientIp}`);
    console.log(`Determined city: ${city}`);

    try {
        // Get weather information from OpenWeatherMap
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: process.env.OPENWEATHERMAP_API_KEY,
                units: 'metric',
            },
        });

        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`,
        });
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);

        if (error.response && error.response.status === 400) {
            return res.status(400).json({ error: 'Bad request to OpenWeatherMap API' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
};
