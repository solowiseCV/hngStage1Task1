import axios from "axios";
export const clientInfo = async (req, res, next) => {
    const visitorName = req.query.visitor_name;

    if (!visitorName) {
        return res.status(400).json({ error: 'Visitor name is required' });
    }

    try {
        // Get location information from ip-api (includes getting the user's IP address)
        const locationResponse = await axios.get(`http://ip-api.com/json/`);
        const { query: clientIp, city, status, message } = locationResponse.data;

        if (status !== 'success') {
            console.error(`Error from ip-api: ${message}`);
            return res.status(400).json({ error: 'Unable to determine location from IP address' });
        }

        console.log(`Client IP: ${clientIp}`);
        console.log(`Determined city: ${city}`);

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
