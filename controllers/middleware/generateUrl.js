import crypto from "crypto";
// Function to generate a unique short URL
export const generateShortUrl = (url) => {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return hash.substring(0, 6); // Change the length as needed
}

export const shortenUrl = async (longUrl) => {
    try {
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.shorturl) {
                return data.shorturl;
            } else {
                throw new Error('Impossible de raccourcir le lien');
            }
        } else {
            throw new Error('Erreur lors du raccourcissement du lien');
        }
    } catch (error) {
        console.error('Erreur:', error);
        return { error: 'Une erreur est survenue lors du traitement de votre demande' };
    }
};