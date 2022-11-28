const fs = require('fs')
const mime = require('mime')


stringToImages = async (base64images, callback) => {
    imageUrls = [];
    for (i=0; i < base64images.length; i++) {
        var matches = base64images[i].match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
        response = {};
        
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        
        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');
        let decodedImg = response;
        let imageBuffer = decodedImg.data;
        let type = decodedImg.type;
        let extension = mime.extension(type);
        let fileName = generateFileName()+"." + extension;
        try {
            fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
            imageUrls.push("/images/" + fileName)
        } catch (error) {
            return callback(error);
        }
    }

    if(imageUrls.length = base64images.length) {
        callback(null, imageUrls);
    }
    else {
        return callback(error);
    }
    
}

const imageConverter = {

    convert(base64images) { 
        try {
            imageUrls = [];
            for (i=0; i < base64images.length; i++) {
                var matches = base64images[i].match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
                response = {};
                
                if (matches.length !== 3) {
                    return new Error('Invalid input string');
                }
                
                response.type = matches[1];
                response.data = Buffer.from(matches[2], 'base64');
                let decodedImg = response;
                let imageBuffer = decodedImg.data;
                let type = decodedImg.type;
                let extension = mime.extension(type);
                let fileName = generateFileName()+"." + extension;
                try {
                    fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
                    imageUrls.push("/images/" + fileName)
                } catch (error) {
                    return undefined;
                }
            }
        
            if(imageUrls.length = base64images.length) {
                return imageUrls;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            console.log(e);
            // return [error]
            return res.status(500).json({message: e.message})
        }
    }
}

function generateFileName() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 10; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(Math.random() * (999 - 100) + 100).toString()+ result.toUpperCase();
};

module.exports = imageConverter