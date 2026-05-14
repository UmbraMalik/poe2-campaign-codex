# POE2 Campaign Codex Overlay Landing

Статичный одностраничный сайт для beta-версии POE2 Campaign Codex Overlay.

## Что внутри

- `index.html` — разметка сайта
- `styles.css` — дизайн
- `script.js` — плавный scroll
- `assets/` — папка под скриншоты и будущие картинки

## Что нужно заменить перед публикацией

1. В `index.html` найти блок `#download` и заменить ссылку кнопки:
   `href="#"` → ссылка на GitHub Release / Google Drive / Яндекс Диск / Telegram-пост.

2. В блоке `#support` заменить QR-заглушку на реальный QR Альфа-Банка.
   Подробная инструкция ниже.

3. В блоке `#support` заменить ссылки Telegram / Фидбек на реальные адреса, если они нужны.

4. В секции `#screens` заменить placeholder-блоки на реальные скриншоты.

Пример:

```html
<div class="screenshot-placeholder">
  <img src="./assets/screens/overlay.png" alt="Overlay screenshot">
</div>
```

И добавить CSS:

```css
.screenshot-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Где бесплатно выложить

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

Сервер не нужен. Это обычный статичный сайт.

## QR для поддержки через Альфа-Банк

В блоке «Поддержать» сейчас стоит заглушка:

```html
<img src="./assets/support/alfa-qr-placeholder.svg" alt="QR-код для перевода через Альфа-Банк" loading="lazy" />
```

Чтобы поставить настоящий QR:

1. Сохрани QR-код как `assets/support/alfa-qr.png`.
2. В `index.html` замени путь картинки на:

```html
<img src="./assets/support/alfa-qr.png" alt="QR-код для перевода через Альфа-Банк" loading="lazy" />
```

Текст приписки для перевода уже добавлен: `Поддержка POE2 Campaign Codex`.


## Скриншот оверлея

В hero-блок сайта добавлен реальный скриншот приложения: `assets/screens/overlay-real-reference.png`.


Обновление: в секции скриншотов добавлены реальные референсы Companion Panel и режима «только таймер».
