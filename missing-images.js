import fs from 'fs';
import path from 'path';

// Path to factions.json and images directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const factionsFilePath = path.join(__dirname, 'app/data/factions.json');
const imagesDirPath = path.join(__dirname, 'public/images');

// Read factions.json
const factionsData = JSON.parse(fs.readFileSync(factionsFilePath, 'utf-8'));

// Collect all faction IDs
const factionIds = factionsData.flatMap(group =>
  group.factions.map(faction => faction.id)
);

// Get all image filenames in the directory
const imageFiles = fs.readdirSync(imagesDirPath).filter(file => file.endsWith('.jpg'));

// Check for missing images
const missingImages = factionIds.filter(id => !imageFiles.includes(`${id}.jpg`));

if (missingImages.length > 0) {
  console.log('Missing images:', missingImages);
} else {
  console.log('All images are present.');
}