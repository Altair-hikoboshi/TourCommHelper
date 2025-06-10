const jsonFile = document.currentScript.getAttribute('data-json');

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (!voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }
}

loadVoices();

const categoryContainer = document.getElementById("category-container");
const expressionsDiv = document.getElementById("expressions");

let fetchedData = {};
let highlightedOnce = false;

fetch(jsonFile)
  .then(res => res.json())
  .then(data => {
    fetchedData = data;

    const selectedCategory = getQueryParam('category');
    if (selectedCategory && fetchedData[selectedCategory]) {
      showExpressions(selectedCategory);
    }

    Object.keys(data).forEach((category, i) => {
      const button = document.createElement("button");
      button.className = "category-button";
      button.textContent = category;
      button.style.setProperty('--i', i);
      button.onclick = (event) => {
        event.stopPropagation();
        showExpressions(category);
      };
      categoryContainer.appendChild(button);
    });
  })
  .catch(err => {
    categoryContainer.textContent = 'Failed to load categories.';
    console.error(err);
  });

function showExpressions(category) {
  const expressions = fetchedData[category];
  expressionsDiv.innerHTML = `<h2>${category}</h2>` + expressions.map((pair, i) =>
    `<div class="expression" style="--i:${i}">
       <div class="expression-content">
         <div class="expression-texts">
           <strong>${pair[0]}</strong>
           <em>${pair[1]}</em>
         </div>
         <div class="play-buttons">
           <button onclick="speakText(\`${pair[0]}\`, 'en')" aria-label="Play English">🔊 EN</button>
           <button onclick="speakText(\`${pair[1]}\`, 'id')" aria-label="Play Indonesian">🔊 ID</button>
         </div>
       </div>
     </div>`).join("");

  expressionsDiv.style.display = "block";
  expressionsDiv.style.animation = "slideUp 0.4s ease forwards";
  expressionsDiv.scrollIntoView({ behavior: "smooth" });

  if (!highlightedOnce) {
    const indexToHighlight = parseInt(getQueryParam('index'));
    if (!isNaN(indexToHighlight)) {
      const expressionElems = document.querySelectorAll('.expression');
      const targetIndex = indexToHighlight;
      if (expressionElems[targetIndex]) {
        expressionElems[targetIndex].classList.add('highlighted');
        setTimeout(() => {
          expressionElems[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
    highlightedOnce = true;
  }
}

function speakText(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
  speechSynthesis.speak(utterance);
}

function hideExpressions() {
  expressionsDiv.style.animation = "slideDown 0.4s ease forwards";
  expressionsDiv.addEventListener("animationend", function handler() {
    expressionsDiv.style.display = "none";
    expressionsDiv.removeEventListener("animationend", handler);
  });
}

document.addEventListener("click", function(event) {
  if (!expressionsDiv.contains(event.target)) {
    if (expressionsDiv.style.display === "block") {
      hideExpressions();
    }
  }
});

expressionsDiv.addEventListener("click", function(event) {
  event.stopPropagation();
});
