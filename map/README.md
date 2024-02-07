# ONEMap

<a name="id-installation"></a>
## Installation
- **Open with Expo**
    1. Download “Expo” App on App Store and Google Play
    2. Scan the QR code at this URL: [https://expo.dev/@technotech/ONEMap](https://expo.dev/@technotech/ONEMap)
- **Open on local**:
    1. **Download XCode for OS or "Expo" app on mobile**
    2. **Clone the repo**: 

      git clone https://github.com/rika97/ONEMap.git
    3. **Install dependencies:**

      npm install
    4. **Get an API key for Firebase** (Free with Spark plan)
        - Go to [Firebase console](https://console.firebase.google.com/)
        - Click on "Add project"
        - Go to "project settings" → "add app", and create a new web app
        - Add firebase SDK using npm
        - Copy and paste credentials to firebaseConfig inside App.js
    5. **Get an API key for Google Maps API** (90-day $300 free trial with $100 bonus for organization free trial)
        - Go to [Google Cloud console](https://console.cloud.google.com/)
        - Create a new project
        - Navigate to Google Maps Platform → Credentials → Create Credentials → API key
        - Copy and paste the API key to:
            - api_key in Map.jsx
            - ios.googleMapsApiKey and android.config.googleMaps.apiKey in app.json
            - api_key in Createevent.jsx
            - api_key in Addphoto.jsx
    6. **Start the app**

              npm start

        Enter “i” to open with XCode Simulator or scan QR 
        code with a mobile device to run on Expo App.

* **Colors**:
    * Primary: #00ace8
    * Secondary: #8abbc2
    * Tertiary: #bce3e8
    * Quaternary: #cfe3e6
    * Error: #FF0000
    * Warning: #143F73

