# AI-Based Carbon Emission Prediction + India Power Map

An integrated electricity-grid intelligence platform combining the AI carbon-emission prediction project with the existing [Power Map of India](https://github.com/reclaimchennai/power-map-india).

## Planned application areas
- **Power Map** — existing 3D electricity-grid visualization, station data, transmission and fuel-supply context.
- **Coal Tracker** — existing national coal overview, station stock, receipts/consumption, supply-chain map and station explorer.
- **Carbon Intelligence** — station-level CEA CO₂ baseline, fuel breakdown, historical intensity and transparent linear trend projections. The current projection is a statistical baseline, not a trained AI model.
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
The Power Map source and datasets have been imported. The Carbon Intelligence dashboard is available at `/carbon/` and reads the imported `web/data/emissions.json` and `web/data/plants.json` datasets. Its historical trend projection is explicitly a statistical baseline, not a trained ML forecast. Smart-home ingestion, trained model validation, automated tests and production deployment remain future work.