# Music folder

Drop free tracks here (YouTube Audio Library or other licensed free music). Audio files are git-ignored.

Tag the mood in the **file name prefix**: `sad_rainy-day.mp3`, `love_slow-dance.mp3`, `revenge_dark-drive.mp3`.
The pipeline picks a random track whose name starts with the short's `mood` (or set `"music": "exact_file.mp3"` in the spec).
Supported: mp3, wav, m4a, ogg, flac.
