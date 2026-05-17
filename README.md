# POE2 Campaign Codex Overlay Landing

Статический сайт для POE2 Campaign Codex Overlay.

## Счётчик загрузок

Публичная цифра на сайте берётся из `stats/downloads.json`, а не напрямую из GitHub Releases API в браузере.

Почему так:

- GitHub `download_count` привязан к конкретному release asset.
- Если asset удалить, перезалить или пересоздать, live-цифра может выглядеть как сброс.
- Сайт должен показывать накопительный счётчик, который не уменьшается.

Схема:

1. `.github/workflows/update-download-stats.yml` запускается раз в час и вручную через `workflow_dispatch`.
2. `scripts/update-download-stats.mjs` читает GitHub Releases API репозитория `UmbraMalik/poe2-campaign-codex-releases`.
3. Считаются только installer `.exe` файлы:
   - файл заканчивается на `.exe`;
   - файл не заканчивается на `.blockmap`;
   - имя содержит `setup` или `campaign-codex`.
4. Не считаются `latest.yml`, `.blockmap` и архивы исходников.
5. `stats/downloads-state.json` хранит техническое состояние и high-water mark по каждому asset.
6. `stats/downloads.json` хранит публичную статистику для сайта.

Если GitHub отдаст меньшее значение `download_count`, общий `totalDownloads` не уменьшается.
