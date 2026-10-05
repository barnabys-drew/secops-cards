"""Generate the app icons with the standard library only (no Pillow)."""
import pathlib
import struct
import zlib

BG = (15, 20, 25)
CARD = (232, 238, 244)
ACCENT = (80, 200, 140)


def png(size: int, pixel) -> bytes:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(pixel(x / size, y / size))

    def chunk(tag: bytes, data: bytes) -> bytes:
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    return (b"\x89PNG\r\n\x1a\n"
            + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + chunk(b"IEND", b""))


def pixel(u: float, v: float):
    """Dark tile, a light card with a green bar (a flashcard) kept inside the maskable safe zone."""
    if 0.28 <= u <= 0.72 and 0.30 <= v <= 0.70:
        return ACCENT if 0.42 <= v <= 0.48 and 0.34 <= u <= 0.66 else CARD
    return BG


def write_all(out: pathlib.Path) -> None:
    for size in (180, 192, 512):
        (out / f"icon-{size}.png").write_bytes(png(size, pixel))


if __name__ == "__main__":
    write_all(pathlib.Path(__file__).parent / "docs" / "icons")
