# MotoLog GPX Processing with Road Snapping

This document explains the enhanced GPX processing system in MotoLog that provides accurate road-following routes and realistic speed profiles.

## Architecture Overview

The GPX processing pipeline consists of three main stages:

1. **GPX Parsing**: Extract trackpoints from GPX files
2. **Road Snapping**: Use OSRM to snap points to actual roads
3. **Speed Profiling**: Apply realistic speed variations based on road types

## Setup Instructions

### 1. Install OSRM (Open Source Routing Machine)

OSRM is required for road snapping functionality. Follow these steps:

#### On Ubuntu/Debian:
```bash
# Install dependencies
sudo apt update
sudo apt install build-essential git cmake pkg-config libbz2-dev libxml2-dev libzip-dev libboost-all-dev lua5.2 liblua5.2-dev libtbb-dev

# Clone and build OSRM
git clone https://github.com/Project-OSRM/osrm-backend.git
cd osrm-backend
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
sudo make install
```

#### Download OSM Data
```bash
# Download a PBF file for your region (example: Germany)
wget https://download.geofabrik.de/europe/germany-latest.osm.pbf

# Prepare the data
osrm-extract germany-latest.osm.pbf
osrm-partition germany-latest.osrm
osrm-customize germany-latest.osrm
```

#### Start OSRM Server
```bash
osrm-routed --algorithm mld germany-latest.osrm
```

The server will run on `http://localhost:5000` by default.

### 2. Configure Environment Variables

Set the OSRM URL in your environment:
```bash
export OSRM_URL=http://localhost:5000
```

Or modify the `OSRM_URL` variable in `app.py`.

### 3. Alternative: Use a Hosted OSRM Service

If you don't want to self-host OSRM, you can use a hosted service or modify the code to use other routing APIs.

## How It Works

### GPX Upload Process

1. **Parse GPX**: Extract `<trkpt>` elements with lat/lon coordinates
2. **Road Snapping**: Send coordinates to OSRM match service to snap to roads
3. **Speed Profile**: Apply realistic speeds based on inferred road types
4. **Statistics**: Calculate accurate distance, time, and speed metrics

### Speed Profile System

The system applies different speed profiles based on road types:

- **Motorway**: 120 km/h base ±20%
- **Primary**: 80 km/h base ±30%
- **Secondary**: 60 km/h base ±40%
- **Residential/City**: 30 km/h base ±50%

Traffic lights and stops are simulated in urban areas.

### API Endpoints

- `POST /api/ride/upload-gpx`: Upload and process GPX file
  - Returns processed points with road snapping and speed profiles
  - Includes calculated statistics

## Troubleshooting

### OSRM Connection Issues
- Ensure OSRM server is running on the configured URL
- Check that the OSM data covers your GPX route area
- Verify network connectivity between Flask app and OSRM

### GPX Parsing Errors
- Ensure GPX files contain `<trk>` elements with `<trkpt>` points
- Check that coordinates are valid (lat: -90 to 90, lon: -180 to 180)

### Performance Issues
- Large GPX files may take time to process
- OSRM matching can be slow for dense point clouds
- Consider preprocessing GPX files to reduce point density

## Future Enhancements

- Integration with commercial routing APIs (Google Maps, Mapbox)
- Machine learning-based speed prediction
- Historical traffic data integration
- Multi-modal routing (walking, cycling, driving)