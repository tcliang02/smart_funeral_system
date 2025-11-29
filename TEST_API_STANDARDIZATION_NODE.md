# API Standardization Test Script - Node.js Version

## Prerequisites

```bash
npm install node-fetch
```

## Usage

```bash
node TEST_API_STANDARDIZATION.js
```

## Setup

1. **Install dependencies** (if using Node.js):
   ```bash
   cd frontend/my-app
   npm install node-fetch
   ```

2. **Update the script** to use `node-fetch`:
   ```javascript
   // Add at the top of TEST_API_STANDARDIZATION.js
   const fetch = require('node-fetch');
   ```

3. **Update credentials** in the script:
   ```javascript
   const TEST_CREDENTIALS = {
     username: 'YOUR_USERNAME',
     password: 'YOUR_PASSWORD'
   };
   ```

4. **Run the script**:
   ```bash
   node TEST_API_STANDARDIZATION.js
   ```

## Alternative: Use as a Module

```javascript
const { runAllTests } = require('./TEST_API_STANDARDIZATION.js');

runAllTests().then(results => {
  console.log('Test Results:', results);
  process.exit(results.failed > 0 ? 1 : 0);
});
```

## Expected Output

Same as browser version - see `TEST_API_STANDARDIZATION_BROWSER.md`

