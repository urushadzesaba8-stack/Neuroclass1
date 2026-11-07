(() => {
  const filter = document.querySelector('#news-topic');
  const list = document.querySelector('#news-items');
  const updated = document.querySelector('#news-updated');
  const status = document.querySelector('#news-status');
  let feed;
  let loadFailed = false;

  const local = (ka, en) => document.documentElement.lang === 'en' ? en : ka;
  const dateLabel = (value, dateOnly = false) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(local('ka-GE', 'en-GB'), {
      dateStyle: 'medium',
      timeZone: dateOnly ? 'UTC' : 'Asia/Tbilisi',
      ...(dateOnly ? {} : {timeStyle: 'short'}),
    }).format(date);
  };
  const element = (tag, text, cssClass) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (cssClass) node.className = cssClass;
    return node;
  };
  const card = article => {
    const topic = [...filter.options].find(option => option.value === article.topic);
    const node = element('article', '', 'section news-card');
    const heading = element('h2', article.title);
    heading.lang = 'en';
    node.append(element('div', topic?.textContent || '', 'eyebrow'), heading,
      element('p', [article.journal, dateLabel(article.published, true)].filter(Boolean).join(' · ')));
    const summary = article.summary?.[document.documentElement.lang];
    if (typeof summary === 'string' && summary.trim()) {
      node.append(element('div', local('AI-ის შეჯამება · აბსტრაქტი', 'AI brief · Abstract'), 'eyebrow'),
        element('p', summary));
    } else {
      node.append(element('p', local('აბსტრაქტი იხილე PubMed-ზე, თუ ხელმისაწვდომია.', 'Read the abstract on PubMed when available.')));
    }
    const link = element('a', local('გახსენი PubMed-ზე ↗', 'Open on PubMed ↗'), 'source-link');
    link.href = `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    node.append(link);
    return node;
  };

  const render = () => {
    list.replaceChildren();
    if (!feed) {
      status.textContent = loadFailed
        ? local('ნიუსები ამჟამად მიუწვდომელია. შეგიძლია მოძებნო PubMed-ზე.', 'The feed is currently unavailable. You can search PubMed.')
        : local('იტვირთება…', 'Loading…');
      return;
    }
    const lastUpdate = dateLabel(feed.updatedAt);
    updated.textContent = lastUpdate ? `${local('ბოლო განახლება', 'Last updated')} · ${lastUpdate}` : '';
    const articles = feed.items.filter(item => item && /^[0-9]{1,10}$/.test(item.pmid)
      && typeof item.title === 'string' && (filter.value === 'all' || item.topic === filter.value));
    status.textContent = articles.length
      ? local(`${articles.length} პუბლიკაცია`, articles.length === 1 ? '1 publication' : `${articles.length} publications`)
      : local('ამ თემაზე ამჟამად პუბლიკაციები არ ჩანს.', 'No publications for this topic right now.');
    list.append(...articles.map(card));
  };

  filter.addEventListener('change', render);
  document.addEventListener('neuroclass-language', render);
  render();
  fetch('news.json', {cache: 'no-cache'})
    .then(response => {
      if (!response.ok) throw new Error('Feed unavailable');
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data.items)) throw new Error('Invalid feed');
      feed = data;
      render();
    })
    .catch(() => {
      loadFailed = true;
      render();
    });
})();
