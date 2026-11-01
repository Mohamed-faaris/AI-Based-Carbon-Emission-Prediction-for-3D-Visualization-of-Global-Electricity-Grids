import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"


class CarbonDatasetContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.emissions = json.loads((WEB / "data/emissions.json").read_text())
        cls.atlas = json.loads((WEB / "data/plants.json").read_text())

    def test_emissions_dataset_has_metadata_and_station_map(self):
        self.assertIn("generated", self.emissions["meta"])
        self.assertIsInstance(self.emissions["stations"], dict)
        self.assertGreater(len(self.emissions["stations"]), 0)

    def test_emission_station_ids_join_to_power_map(self):
        plant_ids = {plant["id"] for plant in self.atlas["plants"]}
        matched = plant_ids.intersection(self.emissions["stations"])
        self.assertGreater(len(matched), 0)
        self.assertGreater(len(matched) / len(self.emissions["stations"]), 0.5)

    def test_baseline_values_are_non_negative(self):
        for station_id, record in self.emissions["stations"].items():
            for field in ("co2_t", "co2_t_per_mwh"):
                value = record.get(field)
                if value is not None:
                    self.assertGreaterEqual(value, 0, f"{station_id}.{field}")

    def test_historical_intensity_is_numeric(self):
        series_count = 0
        for station_id, record in self.emissions["stations"].items():
            history = record.get("co2_hist") or {}
            for year, value in history.items():
                self.assertRegex(year, r"^20\\d{2}-\\d{2}$")
                self.assertGreaterEqual(float(value), 0, station_id)
            series_count += bool(history)
        self.assertGreater(series_count, 0)

    def test_frontend_assets_exist(self):
        for path in (
            WEB / "carbon/index.html",
            WEB / "carbon/carbon.css",
            WEB / "carbon/carbon.js",
            WEB / "coal/index.html",
            WEB / "index.html",
        ):
            self.assertTrue(path.is_file(), str(path))


if __name__ == "__main__":
    unittest.main()
