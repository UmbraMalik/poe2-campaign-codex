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
const screenWindow = document.getElementById('screen-window');
const screenWindowLabel = document.getElementById('screen-window-label');

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
    const nextVariant = tab.getAttribute('data-screen-variant') || 'landscape';

    if (nextImage) screenPreviewImage.src = nextImage;
    if (nextAlt) screenPreviewImage.alt = nextAlt;
    if (nextTitle) {
      screenPreviewTitle.textContent = nextTitle;
      if (screenWindowLabel) screenWindowLabel.textContent = nextTitle;
    }
    if (nextText) screenPreviewText.textContent = nextText;
    if (screenWindow) screenWindow.dataset.variant = nextVariant;
  });
});


const RELEASES_REPO = "UmbraMalik/poe2-campaign-codex-releases";
const DOWNLOAD_STATS_URL = './stats/downloads.json';
const latestDownloadButtons = Array.from(document.querySelectorAll('[data-latest-download]'));
const installerDownloadsTotalEls = Array.from(document.querySelectorAll('[data-installer-downloads-total]'));
const latestReleaseVersionEls = Array.from(document.querySelectorAll('[data-latest-release-version]'));
const latestReleaseNotesEls = Array.from(document.querySelectorAll('[data-latest-release-notes]'));
const latestReleaseLinkEls = Array.from(document.querySelectorAll('[data-latest-release-link]'));

function isInstallerAsset(asset) {
  const name = String(asset?.name || '').toLowerCase();

  return (
    name.endsWith('.exe') &&
    !name.endsWith('.blockmap') &&
    (name.includes('setup') || name.includes('campaign-codex'))
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function normalizeVersionTag(tagName) {
  if (!tagName) return '—';
  return String(tagName).replace(/^v/i, '');
}

function setTextAll(elements, value) {
  elements.forEach((element) => {
    element.textContent = value;
  });
}

function normalizeReleaseLine(line) {
  return String(line || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/g, '')
    .replace(/^[-*]\s+/g, '')
    .replace(/^—\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractReleaseNoteLines(markdown, maxLines = 4) {
  const raw = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\r/g, '');

  const lines = raw
    .split('\n')
    .map(normalizeReleaseLine)
    .filter(Boolean)
    .filter((line) => !/^исправлено:?$/i.test(line))
    .filter((line) => !/^добавлено:?$/i.test(line))
    .filter((line) => !/^важно:?$/i.test(line))
    .filter((line) => !/^en[- ]?клиент:?$/i.test(line));

  if (lines.length === 0) {
    return ['Описание последнего релиза пока не заполнено.'];
  }

  return lines.slice(0, maxLines);
}

function renderReleaseNotes(elements, notes) {
  const noteLines = Array.isArray(notes) ? notes : extractReleaseNoteLines(notes);

  elements.forEach((element) => {
    element.innerHTML = '';

    noteLines.forEach((note) => {
      const item = document.createElement('li');
      item.textContent = note;
      element.appendChild(item);
    });
  });
}

async function loadPublicDownloadStats() {
  const cacheBuster = `v=${Date.now()}`;
  const separator = DOWNLOAD_STATS_URL.includes('?') ? '&' : '?';
  const response = await fetch(`${DOWNLOAD_STATS_URL}${separator}${cacheBuster}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Download stats request failed: ${response.status}`);
  }

  return response.json();
}

function renderPublicDownloadStats(stats) {
  const totalDownloads = Number(stats?.totalDownloads || 0);
  const latestVersion = normalizeVersionTag(stats?.latestVersion);

  setTextAll(installerDownloadsTotalEls, formatNumber(totalDownloads));

  if (latestVersion !== '—') {
    setTextAll(latestReleaseVersionEls, latestVersion);
  }
}

async function loadLatestReleaseDetails() {
  const latestUrl = `https://api.github.com/repos/${RELEASES_REPO}/releases/latest`;
  const latestResponse = await fetch(latestUrl, { headers: { Accept: 'application/vnd.github+json' } });

  if (!latestResponse.ok) {
    throw new Error(`GitHub latest release request failed: ${latestResponse.status}`);
  }

  return latestResponse.json();
}

function renderLatestReleaseDetails(latestRelease) {
  const latestInstaller = (latestRelease.assets || []).find(isInstallerAsset);
  const versionLabel = normalizeVersionTag(latestRelease.tag_name || latestRelease.name);

  setTextAll(latestReleaseVersionEls, versionLabel);
  renderReleaseNotes(latestReleaseNotesEls, extractReleaseNoteLines(latestRelease.body || latestRelease.name));

  latestReleaseLinkEls.forEach((link) => {
    link.href = latestRelease.html_url || `https://github.com/${RELEASES_REPO}/releases/latest`;
  });

  if (latestInstaller) {
    latestDownloadButtons.forEach((button) => {
      button.href = latestInstaller.browser_download_url;
      button.textContent = `Скачать ${versionLabel}`;
      button.setAttribute('aria-label', `Скачать установщик версии ${versionLabel}`);
    });
  }
}

function renderReleaseFallback(stats) {
  const statsVersion = normalizeVersionTag(stats?.latestVersion);

  if (statsVersion !== '—') {
    setTextAll(latestReleaseVersionEls, statsVersion);
  } else {
    setTextAll(latestReleaseVersionEls, '—');
  }

  renderReleaseNotes(latestReleaseNotesEls, [
    'Не удалось подтянуть данные последнего релиза.',
    'Скачай актуальную сборку вручную через GitHub Releases.'
  ]);

  latestReleaseLinkEls.forEach((link) => {
    link.href = `https://github.com/${RELEASES_REPO}/releases/latest`;
  });

  latestDownloadButtons.forEach((button) => {
    button.textContent = statsVersion !== '—' ? `Скачать ${statsVersion}` : 'Скачать через GitHub';
    button.href = `https://github.com/${RELEASES_REPO}/releases/latest`;
    button.setAttribute('aria-label', 'Открыть GitHub Releases для ручного скачивания');
  });
}

async function loadGithubReleaseStats() {
  if (
    latestDownloadButtons.length === 0 &&
    installerDownloadsTotalEls.length === 0 &&
    latestReleaseVersionEls.length === 0 &&
    latestReleaseNotesEls.length === 0
  ) {
    return;
  }

  let publicStats = null;

  try {
    publicStats = await loadPublicDownloadStats();
    renderPublicDownloadStats(publicStats);
  } catch (error) {
    console.warn('Не удалось загрузить накопительную статистику скачиваний', error);
    setTextAll(installerDownloadsTotalEls, '—');
  }

  try {
    const latestRelease = await loadLatestReleaseDetails();
    renderLatestReleaseDetails(latestRelease);
  } catch (error) {
    console.warn('Не удалось загрузить данные последнего релиза GitHub', error);
    renderReleaseFallback(publicStats);
  }
}

latestDownloadButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (window.ym) {
      window.ym(109210180, 'reachGoal', 'download_installer_click');
    }
  });
});

loadGithubReleaseStats().catch((error) => {
  console.warn('Не удалось загрузить данные релиза и статистики', error);
  setTextAll(installerDownloadsTotalEls, '—');
  renderReleaseFallback(null);
});
