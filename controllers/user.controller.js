import axios from "axios";
import dotenv from 'dotenv'
dotenv.config()

export const clientInfo = async (req, res, next) => {
    const visitorName = req.query.visitor_name;

    if (!visitorName) {
        return res.status(400).json({ error: 'Visitor name is required' });
    }

    // To handle the client IP address
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Handle IPv6-mapped IPv4 addresses
    if (clientIp.includes(':')) {
        clientIp = clientIp.split(':').pop();
    }

    try {
        // Using ipapi API to get the location of the user
        const locationResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
        const { city } = locationResponse.data;
console.log(clientIp);
        if (!city) {
            return res.status(400).json({ error: 'Unable to determine city from IP address' });
        }

        console.log(`Determined city: ${city}`);

        // Using OpenWeatherMap API to get the weather information
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
};