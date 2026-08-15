const fs = require('fs');
const path = require('path');

const src = 'C:/Users/acer/.gemini/antigravity-ide/brain/0628a597-379d-4053-b86b-29b537c255bb/hotel_logo_1785856310991.png';
const dest = path.join(__dirname, 'public', 'hotel_logo.png');

try {
  fs.copyFileSync(src, dest);
  console.log('Logo copied successfully to:', dest);
} catch (err) {
  console.error('Error copying logo:', err);
}
