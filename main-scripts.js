const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Close sidebar when clicking outside it
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
    sidebar.classList.remove('active');
  }
});

let touristData = {};
    let tourGuideData = {};

    async function loadData() {
      try {
        const resTourist = await fetch('tourist.json');
        touristData = await resTourist.json();

        const resTourGuide = await fetch('tour-guide.json');
        tourGuideData = await resTourGuide.json();

        console.log('Data loaded', touristData, tourGuideData);
      } catch (e) {
        console.error('Failed to load JSON files:', e);
      }
    }

    // Search function based on current language and query
    function searchExpressions(query, lang) {
      const results = [];

      function searchInData(data, pageName) {
        for (const category in data) {
          const expressions = data[category];
          expressions.forEach(([eng, ind], index) => {
            const phraseToSearch = lang === 'id' ? ind.toLowerCase() : eng.toLowerCase();
            const otherPhrase = lang === 'id' ? eng.toLowerCase() : ind.toLowerCase();

            if (
              phraseToSearch.includes(query) ||
              category.toLowerCase().includes(query) ||
              otherPhrase.includes(query)
            ) {
              results.push({ page: pageName, category, eng, ind, index });
            }
          });
        }
      }

      searchInData(touristData, 'tourist.html');
      searchInData(tourGuideData, 'tour-guide.html');

      // Sort results to prioritize matches in current language
      results.sort((a, b) => {
        const aMatchLang = lang === 'id' ? a.ind.toLowerCase().includes(query) : a.eng.toLowerCase().includes(query);
        const bMatchLang = lang === 'id' ? b.ind.toLowerCase().includes(query) : b.eng.toLowerCase().includes(query);
        return (bMatchLang === aMatchLang) ? 0 : bMatchLang ? 1 : -1;
      });

      return results;
    }

    // Elements
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearBtn = document.getElementById('clearBtn');

    function renderResults(matches, lang) {
  if (matches.length === 0) {
    searchResults.innerHTML = '<p>No results found.</p>';
    searchResults.style.display = 'block';
    return;
  }
  searchResults.innerHTML = matches
    .map(({ page, category, eng, ind, index }, i) => {
      const url = `${page}?category=${encodeURIComponent(category)}&index=${index}`;
      const displayText = lang === 'id' ? ind : eng;
      return `<p role="option" tabindex="-1" data-index="${i}" data-url="${url}">
                <a href="${url}">${displayText} <small style="color:gray">(${category})</small></a>
              </p>`;
    })
    .join('');
  searchResults.style.display = 'block';
}
    // Clear search input
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.style.display = 'none';
      clearBtn.classList.remove('visible');
      searchInput.focus();
    });

    // Handle input event
   searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  clearBtn.classList.toggle('visible', query.length > 0);

  if (!query) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'none';
    return;
    searchResults.style.display = 'block'; 
  }
  const lang = currentLanguage;
  const results = searchExpressions(query, lang);
  renderResults(results, lang);
  selectedResultIndex = -1;
});
    // Keyboard navigation of results
    let selectedResultIndex = -1;

    searchInput.addEventListener('keydown', (e) => {
      const resultsItems = searchResults.querySelectorAll('p');
      if (!resultsItems.length) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedResultIndex < resultsItems.length - 1) {
          selectedResultIndex++;
          updateActiveResult();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedResultIndex > 0) {
          selectedResultIndex--;
          updateActiveResult();
        }
      } else if (e.key === 'Enter') {
        if (selectedResultIndex >= 0 && selectedResultIndex < resultsItems.length) {
          e.preventDefault();
          const url = resultsItems[selectedResultIndex].dataset.url;
          if (url) {
            window.location.href = url;
          }
        }
      }
    });

    function updateActiveResult() {
      const resultsItems = searchResults.querySelectorAll('p');
      resultsItems.forEach((item, idx) => {
        if (idx === selectedResultIndex) {
          item.classList.add('active');
          item.scrollIntoView({ block: 'nearest' });
          item.setAttribute('aria-selected', 'true');
          searchInput.setAttribute('aria-activedescendant', 'search-result-' + idx);
          item.id = 'search-result-' + idx;
        } else {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
          item.id = '';
        }
      });
    }

    // Language switching logic
    let currentLanguage = 'id';
    function switchLanguage(lang) {
  currentLanguage = lang;

  if (lang === 'id') {
    searchInput.placeholder = 'Ketik kata kunci atau kategori...';
    document.getElementById('app-name').textContent = 'PataLingo';
    document.getElementById('description').textContent =
      'PataLingo adalah aplikasi praktis dan ramah pengguna yang dirancang khusus untuk membantu pemandu wisata dan wisatawan berkomunikasi dengan lebih mudah di berbagai situasi perjalanan. Aplikasi ini menyajikan ratusan ekspresi penting dalam Bahasa Indonesia dan Bahasa Inggris, dikelompokkan ke dalam 9 kategori wisata, mulai dari sambutan, tanya arah, belanja, hingga situasi darurat. Dengan PataLingo, Anda tidak perlu bingung mencari kata-kata yang tepat saat menemani turis mancanegara atau menjelajahi tempat baru di Indonesia. Cukup buka aplikasi, pilih kategori, dan temukan ekspresi yang Anda butuhkan — cepat, tepat, dan sesuai konteks!';
    document.getElementById('closing').textContent =
      'PataLingo, sahabat terbaik Anda dalam menjembatani bahasa dan budaya saat berwisata!';

    // Update buttons
    document.getElementById('btnTourist').textContent = 'Saya adalah Turis';
    document.getElementById('btnTourGuide').textContent = 'Saya adalah Tour Guide';

  } else {
    searchInput.placeholder = 'Type keywords or categories...';
    document.getElementById('app-name').textContent = 'PataLingo';
    document.getElementById('description').textContent =
      'PataLingo is a practical and user-friendly app designed specifically to help tour guides and tourists communicate more easily in various travel situations. The app presents hundreds of essential expressions in Indonesian and English, grouped into 9 travel categories, from greetings, asking directions, shopping, to emergency situations. With PataLingo, you don’t need to struggle finding the right words when accompanying international tourists or exploring new places in Indonesia. Just open the app, choose a category, and find the expressions you need — fast, accurate, and context-appropriate!';
    document.getElementById('closing').textContent =
      'PataLingo, your best friend in bridging language and culture while traveling!';

    // Update buttons
    document.getElementById('btnTourist').textContent = 'I am a Tourist';
    document.getElementById('btnTourGuide').textContent = 'I am a Tour Guide';
  }

  searchInput.value = '';
  searchResults.innerHTML = '';
  clearBtn.classList.remove('visible');
  searchInput.focus();
}

    // Initialize data and UI on load
    window.addEventListener('load', () => {
      loadData();
      switchLanguage(currentLanguage);
    });