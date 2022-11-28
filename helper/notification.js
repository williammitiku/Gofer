const axios = require('axios');

const notification = {

    async send(deviceId, notification, data) {
        try {
    
            await axios
                .post(
                    'https://fcm.googleapis.com/fcm/send', 
                    {
                        to: deviceId,                        
                        notification: notification,
                        data: data
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': process.env.FCM_SERVER_KEY
                        }
                    })
                .then(res => {
                    console.log(`statusCode: ${res.status}`);
                    console.log(res);
                })
                .catch(error => {
                    console.error(error);
                });
        }
        catch (e) {
            console.log(e);
            return  res.status(500).json({message: e.message})
        }
    },

}

module.exports = notification