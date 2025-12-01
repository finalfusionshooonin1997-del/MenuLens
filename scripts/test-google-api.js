import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Simple .env parser
const parseEnv = () => {
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env file not found at', envPath);
        process.exit(1);
    }

    let content = fs.readFileSync(envPath, 'utf-8');
    content = content.replace(/^\uFEFF/, ''); // Remove BOM if present

    const env = {};
    content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            env[key] = value;
        }
    });

    console.log('Keys found in .env:', Object.keys(env));
    return env;
};

const env = parseEnv();
const apiKey = env.VITE_GOOGLE_SEARCH_API_KEY;
const engineId = env.VITE_GOOGLE_SEARCH_ENGINE_ID;

if (!apiKey || !engineId || apiKey.includes('your_') || engineId.includes('your_')) {
    console.error('Error: API Key or Engine ID not set correctly in .env');
    console.log('Current values:', {
        apiKey: apiKey ? 'Set (starts with ' + apiKey.substring(0, 4) + '...)' : 'Missing',
        engineId: engineId ? 'Set' : 'Missing'
    });
    process.exit(1);
}

const query = 'Sushi';
const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${engineId}&key=${apiKey}&searchType=image&num=1`;

console.log('Testing Google Custom Search API...');
console.log(`Query: ${query}`);
console.log(`URL: ${url.replace(apiKey, 'REDACTED')}`);

fetch(url, {
    headers: {
        'Referer': 'http://localhost:5173/'
    }
})
    .then(async (res) => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
    })
    .then(data => {
        console.log('Success! API Response received.');
        if (data.items && data.items.length > 0) {
            console.log('First image result:', data.items[0].link);
        } else {
            console.warn('No items found (but API call was successful).');
        }
    })
    .catch(err => {
        console.error('API Request Failed:');
        console.error(err.message);
    });
