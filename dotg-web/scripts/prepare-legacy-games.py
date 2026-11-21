"""Package the two original Windows builds without executing or changing them."""

import hashlib
import json
from pathlib import Path
import shutil
import zipfile

APP = Path(__file__).resolve().parents[1]
SOURCE = APP.parent / "temp"
OUTPUT = APP / "artifacts" / "legacy-games"
GAMES = json.loads((APP / "content" / "legacy-games.json").read_text(encoding="utf-8"))


def sha256(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def validate_archive(path, required):
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        for name in names:
            parts = name.replace("\\", "/").split("/")
            if name.startswith(("/", "\\")) or ".." in parts or ":" in name:
                raise ValueError(f"Unsafe archive entry: {name}")
        missing = set(required) - names
        if missing:
            raise ValueError(f"Missing runtime files: {sorted(missing)}")
        corrupt = archive.testzip()
        if corrupt:
            raise ValueError(f"Corrupt archive entry: {corrupt}")


def find_runtime(source, name):
    candidates = [source / name, *sorted(source.glob(f"{name}-*/{name}"))]
    matches = [path for path in candidates if path.is_dir()]
    if len(matches) != 1:
        raise ValueError(f"Expected one {name} folder, found {len(matches)}")
    return matches[0]


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = []

    for game in GAMES:
        source = SOURCE / game["sourceDirectory"]
        target = OUTPUT / game["archive"]
        if game["slug"] == "minepg":
            original = source / "MinePG.zip"
            validate_archive(original, [game["executable"], "MinePG/image/main0.png",
                                        "MinePG/_internal/python311.dll"])
            shutil.copyfile(original, target)
            if sha256(original) != sha256(target):
                raise ValueError("MinePG copy checksum mismatch")
        else:
            runtime_dirs = [find_runtime(source, name)
                            for name in ["My project_Data", "MonoBleedingEdge"]]
            with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
                for name in ["My project.exe", "UnityPlayer.dll", "UnityCrashHandler64.exe"]:
                    archive.write(source / name, f"StarFlight/{name}")
                for directory in runtime_dirs:
                    for path in sorted(directory.rglob("*")):
                        if path.is_file():
                            archive.write(path, f"StarFlight/{directory.name}/{path.relative_to(directory).as_posix()}")
            validate_archive(target, [game["executable"], "StarFlight/UnityPlayer.dll",
                                      "StarFlight/My project_Data/globalgamemanagers",
                                      "StarFlight/MonoBleedingEdge/EmbedRuntime/mono-2.0-bdwgc.dll"])

        cover = APP / "public" / game["cover"].lstrip("/")
        cover.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source / game["sourceCover"], cover)
        manifest.append({"slug": game["slug"], "file": game["archive"],
                         "bytes": target.stat().st_size, "sha256": sha256(target),
                         "executable": game["executable"]})
        print(f'{game["title"]}: {target.stat().st_size / 1024**2:.1f} MiB, ZIP integrity OK', flush=True)

    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Packages: {OUTPUT}")


if __name__ == "__main__":
    main()
