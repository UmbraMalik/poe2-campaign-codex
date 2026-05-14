const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


const copyButtons = document.querySelectorAll('[data-copy-target]');

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const targetId = button.getAttribute('data-copy-target');
    const target = targetId ? document.getElementById(targetId) : null;
    const text = target?.textContent?.trim();
    if (!text) return;

    const initialText = button.textContent;

    try {
      await copyText(text);
      button.textContent = 'Скопировано';
      button.classList.add('is-copied');
    } catch (error) {
      button.textContent = 'Не скопировано';
    }

    window.setTimeout(() => {
      button.textContent = initialText;
      button.classList.remove('is-copied');
    }, 1600);
  });
});


const screenTabs = document.querySelectorAll('.screen-tab');
const screenPreviewImage = document.getElementById('screen-preview-image');
const screenPreviewTitle = document.getElementById('screen-preview-title');
const screenPreviewText = document.getElementById('screen-preview-text');

screenTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (!screenPreviewImage || !screenPreviewTitle || !screenPreviewText) return;

    screenTabs.forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-selected', 'false');
    });

    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');

    const nextImage = tab.getAttribute('data-screen-image');
    const nextAlt = tab.getAttribute('data-screen-alt');
    const nextTitle = tab.getAttribute('data-screen-title');
    const nextText = tab.getAttribute('data-screen-text');

    if (nextImage) screenPreviewImage.src = nextImage;
    if (nextAlt) screenPreviewImage.alt = nextAlt;
    if (nextTitle) screenPreviewTitle.textContent = nextTitle;
    if (nextText) screenPreviewText.textContent = nextText;
  });
});
