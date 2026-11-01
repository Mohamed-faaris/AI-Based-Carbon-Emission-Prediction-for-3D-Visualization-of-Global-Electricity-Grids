# AI-Based Carbon Emission Prediction + India Power Map

An integrated electricity-grid intelligence platform combining the AI carbon-emission prediction project with the existing [Power Map of India](https://github.com/reclaimchennai/power-map-india).

## Planned application areas
- **Power Map** — existing 3D electricity-grid visualization, station data, transmission and fuel-supply context.
- **Coal Tracker** — existing national coal overview, station stock, receipts/consumption, supply-chain map and station explorer.
- **Carbon Emissions & AI Prediction** — prediction modelling and visualization, integrated with observed grid data.
- **Home Energy** — planned smart-meter power, energy and emissions dashboard.
- **Home Air Quality** — planned ESP32/MQ-135 sensor history and indicator dashboard.

## Source migration
The public Power Map source is imported by the manual GitHub Actions workflow **Import Power Map source**. It preserves this repository's .github workflows, retains the upstream README at docs/POWER-MAP-UPSTREAM.md, and imports the upstream application, data, scripts, collectors and documentation.

Run it from **Actions → Import Power Map source → Run workflow**.

## Local development
Follow the imported upstream setup instructions in docs/POWER-MAP-UPSTREAM.md and the source-specific README files. The original static frontend can be served with:

    python -m http.server -d web 8000

Open http://localhost:8000.

## Data and attribution
The Power Map source is MIT-licensed. Its datasets have individual source licences and attribution requirements; see data/LICENSES.md, data/README.md, and CITATION.cff. Preserve dataset provenance and source citations when extending or republishing data.

## Integration status
The source-import workflow is the first migration step. AI model integration, smart-home ingestion, unified navigation, automated tests and production deployment must be validated after the source is imported. No live deployment is claimed by this bootstrap.