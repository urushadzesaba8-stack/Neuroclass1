(() => {
  let language = 'ka';
  try {
    if (localStorage.getItem('neuroclass-language') === 'en') language = 'en';
  } catch {}
  const applyLanguage = () => {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-ka][data-en]').forEach(node => {
      if (node instanceof HTMLInputElement) node.placeholder = node.dataset[language];
      else node.textContent = node.dataset[language];
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
  };
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      language = button.dataset.language;
      try { localStorage.setItem('neuroclass-language', language); } catch {}
      applyLanguage();
      document.dispatchEvent(new Event('neuroclass-language'));
    });
  });
  applyLanguage();

  const search = document.querySelector('#search');
  if (search) {
    const category = document.querySelector('#category');
    const type = document.querySelector('#type');
    const cards = [...document.querySelectorAll('[data-module]')];
    const count = document.querySelector('#count');
    const empty = document.querySelector('#empty');
    const normalize = text => text.normalize('NFKC').toLowerCase().replace(/[–—−]/g, '-');
    const renderCatalog = () => {
      const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
      let matches = 0;
      for (const card of cards) {
        const haystack = normalize(card.dataset.search);
        const visible = (category.value === 'all' || card.dataset.category === category.value)
          && (type.value === 'all' || card.dataset.type === type.value)
          && words.every(word => haystack.includes(word));
        card.hidden = !visible;
        if (visible) matches++;
      }
      const moduleLabel = matches === 1 ? 'module' : 'modules';
      count.textContent = language === 'ka' ? `${matches} მოდული` : `${matches} ${moduleLabel}`;
      empty.hidden = matches > 0;
    };
    search.addEventListener('input', renderCatalog);
    category.addEventListener('change', renderCatalog);
    type.addEventListener('change', renderCatalog);
    document.addEventListener('neuroclass-language', renderCatalog);
    renderCatalog();
  }

  const modelNode = document.querySelector('#model');
  if (!modelNode) return;
  const model = JSON.parse(modelNode.textContent);
  const form = document.querySelector('#assessment');
  const fields = [...form.querySelectorAll('select')];
  const result = document.querySelector('#result');
  const selectText = node => node.options[node.selectedIndex].textContent;
  const bilingual = pair => pair[language === 'ka' ? 0 : 1];
  const addText = (parent, tag, value) => {
    const element = document.createElement(tag);
    element.textContent = value;
    parent.append(element);
    return element;
  };
  const renderResult = () => {
    result.replaceChildren();
    const values = fields.map(field => field.value);
    const completed = values.filter(Boolean).length;
    if (completed !== fields.length) {
      addText(result, 'p', bilingual(['შევსებულია', 'Completed']) + ` ${completed}/${fields.length}`);
      addText(result, 'p', bilingual(['შედეგისთვის შეავსე ყველა ველი.', 'Complete all fields to see a result.']));
      return;
    }

    let value;
    let interpretation;
    const code = values.join(',');
    if (model.mode === 'gcs') {
      const components = ['E','V','M'].map((letter, index) => letter + values[index]).join(' ');
      const testable = !values.includes('NT');
      value = testable ? `${values.reduce((sum, item) => sum + Number(item), 0)}/15 · ${components}` : components;
      interpretation = testable ? model.default : model.unknown;
    } else if (values.includes('uncertain')) {
      value = bilingual(['შედეგი დაუდგენელია', 'Indeterminate']);
      interpretation = model.unknown;
    } else {
      const key = model.mode === 'sum' ? String(values.reduce((sum, item) => sum + Number(item), 0))
        : model.mode === 'map' ? model.mapping[code] : values[0];
      value = model.display?.[key] || key;
      interpretation = model.outcomes?.[key] || model.default;
    }

    addText(result, 'strong', `${model.short} · ${value}`);
    if (interpretation) addText(result, 'p', bilingual(interpretation));
    const breakdown = document.createElement('ul');
    fields.forEach(field => {
      addText(breakdown, 'li', `${field.labels[0].firstElementChild.textContent} · ${selectText(field)}`);
    });
    result.append(breakdown);
  };
  form.addEventListener('change', renderResult);
  form.addEventListener('reset', event => {
    event.preventDefault();
    fields.forEach(field => { field.selectedIndex = 0; });
    renderResult();
  });
  document.querySelector('#load-example').addEventListener('click', () => {
    fields.forEach((field, index) => { field.value = model.example[index]; });
    renderResult();
    result.focus();
  });

  const quiz = document.querySelector('#quiz');
  let checked = false;
  const renderQuiz = () => {
    const feedback = document.querySelector('#quiz-score');
    const selections = model.quiz.map((_, index) => quiz.querySelector(`input[name=q${index}]:checked`));
    if (selections.some(selection => !selection)) {
      quiz.querySelectorAll('.feedback').forEach(node => { node.textContent = ''; });
      feedback.textContent = bilingual(['უპასუხე ყველა კითხვას.', 'Answer every question.']);
      return;
    }
    let score = 0;
    model.quiz.forEach((question, index) => {
      const correct = Number(selections[index].value) === question.correct;
      if (correct) score++;
      quiz.querySelector(`#feedback-${index}`).textContent = bilingual(correct
        ? ['სწორია.', 'Correct.'] : ['არასწორია.', 'Incorrect.']) + ' ' + bilingual(question.why);
    });
    feedback.textContent = bilingual(['ქვიზის ქულა', 'Quiz score']) + ` · ${score}/${model.quiz.length}`;
  };
  quiz.addEventListener('submit', event => {
    event.preventDefault();
    checked = true;
    renderQuiz();
  });
  quiz.addEventListener('change', () => { if (checked) renderQuiz(); });
  document.addEventListener('neuroclass-language', () => {
    renderResult();
    if (checked) renderQuiz();
  });
  renderResult();
})();
