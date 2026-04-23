document.addEventListener('DOMContentLoaded', () => {
    const quizGrid = document.getElementById('quizGrid');
    const quizListSection = document.getElementById('quizListSection');
    const activeQuizSection = document.getElementById('activeQuizSection');
    const resultsSection = document.getElementById('resultsSection');
    
    const quizzesTab = document.getElementById('quizzesTab');
    const leaderboardTab = document.getElementById('leaderboardTab');
    const quizzesContent = document.getElementById('quizzesContent');
    const leaderboardContent = document.getElementById('leaderboardContent');
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    const currentQuizTitle = document.getElementById('currentQuizTitle');
    const questionCounter = document.getElementById('questionCounter');
    const progressFill = document.getElementById('progressFill');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    let allQuizzes = [];
    let currentQuiz = null;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let selectedAnswers = {}; // questionId -> option ('A', 'B', etc.)

    const user = JSON.parse(localStorage.getItem('user'));

    // Fetch all quizzes
    async function fetchQuizzes() {
        try {
            const response = await fetch('/api/quizzes');
            allQuizzes = await response.json();
            renderQuizzes();
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            quizGrid.innerHTML = '<p class="error">Failed to load quizzes. Please try again later.</p>';
        }
    }

    function renderQuizzes() {
        if (allQuizzes.length === 0) {
            quizGrid.innerHTML = '<p>No quizzes available at the moment.</p>';
            return;
        }

        quizGrid.innerHTML = allQuizzes.map(quiz => `
            <div class="quiz-card">
                <h3>${quiz.title}</h3>
                <p>${quiz.description || 'No description available.'}</p>
                <div class="quiz-meta">
                    <span><i class="fa-solid fa-clock"></i> 10-15 mins</span>
                    <button class="btn btn-primary btn-sm" onclick="startQuiz(${quiz.id})">Start Quiz</button>
                </div>
            </div>
        `).join('');
    }

    // Start a specific quiz
    window.startQuiz = async (quizId) => {
        try {
            const quizResponse = await fetch(`/api/quizzes/${quizId}`);
            currentQuiz = await quizResponse.json();
            
            const questionsResponse = await fetch(`/api/quizzes/${quizId}/questions`);
            currentQuestions = await questionsResponse.json();
            
            if (currentQuestions.length === 0) {
                alert('This quiz has no questions yet.');
                return;
            }

            currentQuestionIndex = 0;
            selectedAnswers = {};
            
            quizListSection.style.display = 'none';
            activeQuizSection.style.display = 'block';
            
            renderQuestion();
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Failed to start quiz.');
        }
    };

    function renderQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        currentQuizTitle.textContent = currentQuiz.title;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
        
        questionText.textContent = q.questionText;
        
        const options = [
            { id: 'A', text: q.optionA },
            { id: 'B', text: q.optionB },
            { id: 'C', text: q.optionC },
            { id: 'D', text: q.optionD }
        ];

        optionsContainer.innerHTML = options.map(opt => `
            <div class="option-item ${selectedAnswers[q.id] === opt.id ? 'selected' : ''}" onclick="selectOption('${opt.id}')">
                <span class="option-letter">${opt.id}</span>
                <span class="option-text">${opt.text}</span>
            </div>
        `).join('');

        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Finish Quiz' : 'Next';
    }

    window.selectOption = (optionId) => {
        const q = currentQuestions[currentQuestionIndex];
        selectedAnswers[q.id] = optionId;
        renderQuestion();
    };

    nextBtn.addEventListener('click', () => {
        if (!selectedAnswers[currentQuestions[currentQuestionIndex].id]) {
            alert('Please select an answer before proceeding.');
            return;
        }

        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    async function submitQuiz() {
        try {
            const submission = {
                studentId: user.id,
                quizId: currentQuiz.id,
                answers: selectedAnswers
            };

            const response = await fetch('/api/quizzes/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Server returned an error');
            }

            const result = await response.json();
            showResults(result);
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz: ' + error.message);
            
            if (error.message.includes('Invalid student')) {
                alert('Your session may have expired (database reset). Please log out and register again.');
            }
        }
    }

    function showResults(result) {
        activeQuizSection.style.display = 'none';
        resultsSection.style.display = 'block';
        
        document.getElementById('finalScore').textContent = result.score;
        document.getElementById('scoreLabel').textContent = `out of ${result.total}`;
        
        const percentage = (result.score / result.total) * 100;
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');

        if (percentage >= 80) {
            resultTitle.textContent = "Excellent!";
            resultMessage.textContent = "You've mastered this topic! Your score has been recorded.";
        } else if (percentage >= 50) {
            resultTitle.textContent = "Good Job!";
            resultMessage.textContent = "You passed! Keep practicing to improve your score.";
        } else {
            resultTitle.textContent = "Keep Practicing";
            resultMessage.textContent = "Don't give up! Review the material and try again.";
        }
    }

    // Tab Switching Logic
    quizzesTab.addEventListener('click', () => {
        quizzesTab.classList.add('active');
        leaderboardTab.classList.remove('active');
        quizzesTab.style.color = 'var(--primary-color)';
        quizzesTab.style.borderBottom = '2px solid var(--primary-color)';
        leaderboardTab.style.color = '#64748b';
        leaderboardTab.style.borderBottom = 'none';
        
        quizzesContent.style.display = 'block';
        leaderboardContent.style.display = 'none';
    });

    leaderboardTab.addEventListener('click', () => {
        leaderboardTab.classList.add('active');
        quizzesTab.classList.remove('active');
        leaderboardTab.style.color = 'var(--primary-color)';
        leaderboardTab.style.borderBottom = '2px solid var(--primary-color)';
        quizzesTab.style.color = '#64748b';
        quizzesTab.style.borderBottom = 'none';
        
        quizzesContent.style.display = 'none';
        leaderboardContent.style.display = 'block';
        fetchLeaderboard();
    });

    async function fetchLeaderboard() {
        try {
            const response = await fetch('/api/quizzes/leaderboard');
            const leaderboard = await response.json();
            renderLeaderboard(leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

    function renderLeaderboard(data) {
        if (data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 32px;">No results yet. Be the first to take a quiz!</td></tr>';
            return;
        }

        leaderboardBody.innerHTML = data.map((entry, index) => `
            <tr>
                <td><span class="rank-badge ${index < 3 ? 'rank-' + (index + 1) : ''}">${index + 1}</span></td>
                <td><strong>${entry.studentName}</strong></td>
                <td>${entry.quizTitle}</td>
                <td><span class="score-pill">${entry.score} / ${entry.total}</span></td>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    fetchQuizzes();
});
