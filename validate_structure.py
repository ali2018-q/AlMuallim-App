from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = [
    "settings.gradle.kts", "build.gradle.kts", "app/build.gradle.kts",
    "app/src/main/AndroidManifest.xml", "core/model/build.gradle.kts",
    "firebase.json", "firebase/firestore.rules", "functions/package.json",
    "functions/src/index.ts", "docs/ARCHITECTURE.md",
    ".github/workflows/android-ci.yml", ".github/workflows/functions-ci.yml",
]
missing = [item for item in required if not (ROOT / item).is_file()]
assert not missing, f"Missing required files: {missing}"

settings = (ROOT / "settings.gradle.kts").read_text()
for module in [":app", ":core:model", ":core:common", ":feature:home",
               ":feature:quiz", ":feature:profile", ":feature:leaderboard",
               ":feature:settings"]:
    assert module in settings, f"Module not included: {module}"

rules = (ROOT / "firebase/firestore.rules").read_text()
assert "match /questionKeys/{questionId}" in rules
assert "allow read, write: if false;" in rules
print(f"Repository structure OK: {len(required)} required files, 8 Gradle modules.")
