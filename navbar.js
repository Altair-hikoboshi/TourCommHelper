  function showQuizzes(category) {
    const quizList = document.getElementById('quiz-list');
    quizList.style.display = "block"; 

    const categoryMap = {
      multiple: {
        label: "Multiple Choice",
        folder: "multi",
        prefix: "multi"
      },
      short: {
        label: "Short Answer",
        folder: "short",
        prefix: "short"
      },
      matching: {
        label: "Matching",
        folder: "match",
        prefix: "match"
      }
    };

    const data = categoryMap[category];

    let content = `<h2>${data.label} Quizzes</h2>`;
    for (let i = 1; i <= 5; i++) {
      content += `
        <a href="assets/quizzes/${data.folder}/${data.prefix}${i}.pdf" download>
          Part ${i} of ${data.label} (Download)
        </a>`;
    }

    quizList.innerHTML = content;
  }