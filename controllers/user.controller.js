import axios from 'axios';

export const clientInfo = async (req, res) => {
    try {
        const userName = req.query.visitorName;
        if (!userName) {
            return res.status(400).json({ message: 'Visitor name is required' });
        }

        // Retrieve client's IP address from req.headers or req.socket
        let clientsIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'; 

        // const testIP = '8.8.8.8'; 
        const geoResponse = await axios.get(`https://ipapi.co/${clientsIp}/json/`);
        if (geoResponse.data.error) throw new Error('Unable to locate IP address.');

        const { latitude, longitude, city, region, country_name } = geoResponse.data;

        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat: latitude,
                lon: longitude,
                appid: process.env.WEATHER_APP_API_KEY, // Use process.env.WEATHER_APP_API_KEY
                units: 'metric'
            }
        });

        const weatherData = weatherResponse.data;

        // Handle IPv6-mapped IPv4 addresses
        if (clientsIp.includes('::ffff:')) {
            clientsIp = clientsIp.split(':').pop();
        }

        // Return all relevant data including weather
        return res.status(200).json({
            clientsIp,
            visitorName: userName,
            location: {
                city,
                region,
                country: country_name,
                latitude,
                longitude
            },
            weather: {
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
