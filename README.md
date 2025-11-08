# Colegios Cataluña - School Map Application

An interactive map application displaying schools in Catalonia, Spain. Built with React and Leaflet.

## Features

- 🗺️ Interactive map showing all schools in Catalonia
- 🏫 Filter schools by program types (EPRI, ESO, BATX, CFPM, etc.)
- 🎨 Color-coded markers: Green for Public schools, Orange for Private schools
- 📍 School information popups with details
- 🔍 Filter by multiple education program types

## Technologies Used

- React 18
- Leaflet & React-Leaflet for mapping
- Mapbox for map tiles
- PapaParse for CSV parsing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/colegios_cataluna.git
cd colegios_cataluna
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
colegios_cataluna/
├── public/
│   ├── index.html
│   └── totcat-centres-educatius.csv  # School data
├── src/
│   ├── App.js                        # Main application component
│   ├── App.css                       # Styles
│   ├── index.js                      # Entry point
│   └── mapboxConfig.js               # Mapbox configuration
└── package.json
```

## Data Source

School data is sourced from the Catalan government's open data portal (`totcat-centres-educatius.csv`).

## Deployment

This project is configured for GitHub Pages deployment. To deploy:

```bash
npm run deploy
```

The site will be available at: `https://YOUR_USERNAME.github.io/colegios_cataluna/`

## License

This project is open source and available for educational purposes.

