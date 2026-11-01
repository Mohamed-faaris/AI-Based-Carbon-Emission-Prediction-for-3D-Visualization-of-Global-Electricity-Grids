# Integration plan

## Target
This repository is the integration destination. The public upstream source is reclaimchennai/power-map-india. The upstream repository is read-only to this GitHub connection, so migration is performed from this repository using GitHub Actions and the upstream public clone URL.

## Preserve during migration
- web/: original Power Map frontend and Coal Tracker page.
- data/, build/, raw/: datasets, build artifacts and source provenance.
- scrapers/, scripts/, tools/, store.py: collection and export pipeline.
- api/: existing FastAPI service.
- docs/, requirements.txt, CITATION.cff, LICENSE: documentation and licensing.

The import workflow preserves this repository's .github/ directory. The upstream README is retained as docs/POWER-MAP-UPSTREAM.md.

## Integration phases
1. Import upstream code and datasets without changing their behavior.
2. Audit the AI prediction project's model code, dependencies, training data, inference interface and 3D visualization before connecting it.
3. Integrate observed grid data and predictions as distinct data products. Never label a model prediction as a measured emission value.
4. Integrate unified navigation while retaining original Power Map and Coal Tracker routes and assets.
5. Add smart-home ingestion (MQTT/ESP32/meter simulator) as an isolated module; it must not block the existing public-data pipeline.
6. Add tests for data contracts, API routes, dashboard asset loading and model inference; then configure deployment for the selected hosting provider.

## Deployment gate
The destination repository and source-import workflow are prepared. Production deployment is not configured yet because the hosting provider, domain and required environment secrets have not been confirmed. Never commit API tokens, MQTT credentials or model secrets.