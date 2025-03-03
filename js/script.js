document.addEventListener("DOMContentLoaded", () => {
    const switcher = document.getElementById("switcher");
    const sunLight = document.getElementById("sun-light");
    const sunDark = document.getElementById("sun-dark");
    const moonLight = document.getElementById("moon-light");
    const moonDark = document.getElementById("moon-dark");
    const background = document.getElementById("background");

    const currentTheme = localStorage.getItem("theme") || "light";
    applyTheme(currentTheme);
    switcher.checked = currentTheme === "dark";

    switcher.addEventListener("change", () => {
        const newTheme = switcher.checked ? "dark" : "light";
        localStorage.setItem("theme", newTheme);
        applyTheme(newTheme);
    });

    function applyTheme(theme) {
        document.body.classList.toggle("dark-theme", theme === "dark");
        document.body.classList.toggle("light-theme", theme === "light");
        background.classList.toggle("dark-background", theme === "dark");
        background.classList.toggle("light-background", theme === "light");

        document.body.style.backgroundColor = theme === "dark" ? "#121212" : "#f5f5f5";
        document.body.style.color = theme === "dark" ? "#ffffff" : "#000000";
        background.style.backgroundColor = theme === "dark" ? "#1e1e1e" : "#ffffff";

        updateIcons(theme);
    }

    function updateIcons(theme) {
        sunLight.classList.toggle("hidden", theme === "dark");
        sunDark.classList.toggle("hidden", theme !== "dark");
        moonLight.classList.toggle("hidden", theme !== "dark");
        moonDark.classList.toggle("hidden", theme === "dark");

    }
});



document.addEventListener("DOMContentLoaded", () => {

    let quizData = null;
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let acceptingAnswers = true;



    const quizContainer = document.createElement("div");
    document.body.appendChild(quizContainer);

    fetch("./data.json")
        .then(response => response.json())
        .then(data => {
            quizData = data;
            currentQuiz = data.quizzes[0];
            loadProgress(data);
            loadQuestion();
        })
        .catch(error => console.error("Error loading quiz data:", error));

    function loadProgress(data) {
        const savedQuizIndex = localStorage.getItem("currentQuizIndex");
        const savedQuestionIndex = localStorage.getItem("currentQuestionIndex");

        if (savedQuizIndex !== null && savedQuestionIndex !== null) {
            const quizIndex = parseInt(savedQuizIndex);
            const questionIndex = parseInt(savedQuestionIndex);

            if (quizIndex >= 0 && quizIndex < data.quizzes.length) {
                currentQuiz = data.quizzes[quizIndex];
            }

            if (questionIndex >= 0 && questionIndex < currentQuiz.questions.length) {
                currentQuestionIndex = questionIndex;
            }
        }
    }

    function saveProgress() {
        localStorage.setItem("currentQuizIndex", quizData.quizzes.indexOf(currentQuiz));
        localStorage.setItem("currentQuestionIndex", currentQuestionIndex);
    }

    function loadQuestion() {
        if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
            return showQuizResults();
        }

        const questionData = currentQuiz.questions[currentQuestionIndex];
        quizContainer.innerHTML = `
            <h2>${questionData.question}</h2>
            <ul>
                ${questionData.options.map((option, index) => `
                    <li>
                        <button class="data-answer" data-answer="${String.fromCharCode(65 + index)}">
                            ${String.fromCharCode(65 + index)}. ${option}
                        </button>
                    </li>
                `).join('')}
            </ul>
            <div id="question_count">Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</div>
            <div id="progress_bar" style="width: ${(currentQuestionIndex + 1) / currentQuiz.questions.length * 100}%; height: 10px; background: blue;"></div>
        `;

        document.querySelectorAll(".data-answer").forEach(button => {
            button.addEventListener("click", handleOptionClick);
        });
    }

    function handleOptionClick(event) {
        if (!acceptingAnswers) return;

        const selectedAnswer = event.target.getAttribute("data-answer");
        const correctAnswer = currentQuiz.questions[currentQuestionIndex].answer;

        if (selectedAnswer === correctAnswer) {
            score++;
        }

        acceptingAnswers = false;
        setTimeout(() => {
            currentQuestionIndex++;
            acceptingAnswers = true;
            if (currentQuestionIndex < currentQuiz.questions.length) {
                saveProgress();
                loadQuestion();
            } else {
                showQuizResults();
            }
        }, 1000);
    }

    function showQuizResults() {
        quizContainer.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p>Your score: ${score} out of ${currentQuiz.questions.length}</p>
        `;
    }
});
