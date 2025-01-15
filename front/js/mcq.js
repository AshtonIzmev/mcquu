import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

let supabaseClient = null;
if (enableSupabase) {
    supabaseClient = createClient(supabase_url, supabase_key)
}

let currentQuestion = 0;
let user_identification = null;

// Function to generate browser-dependent seed
function generateSeed() {
    let seed = localStorage.getItem('seed');
    if (!seed) {
        seed = Math.random().toString(36).substring(2);
        localStorage.setItem('seed', seed);
    }
    return seed;
}

// Function to shuffle questions with a seed
function shuffleQuestions(array, seedString) {
    // Create a seeded random number using a simple hash of the string
    var seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the seed to create a simple random number generator
    const random = () => {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showToast(text, background) {
    Toastify({
        text: text,
        duration: 2000,
        close: true,
        gravity: "bottom",
        position: "center",
        stopOnFocus: true,
        style: {
          background: background,
        },
        onClick: function(){}
      }).showToast();
}

// Modify the localStorage structure to include answers
const savedProgress = JSON.parse(localStorage.getItem(localStorageKey)) || {};
if (savedProgress.user_identification) {
    user_identification = savedProgress.user_identification;
    currentQuestion = savedProgress.currentQuestion || 0;
    // Restore UI state if user already started
    document.getElementById('firstName').value = user_identification.split('|')[0];
    document.getElementById('lastName').value = user_identification.split('|')[1];
    document.getElementById('quiz').style.display = 'block';
}

window.submitUserInfo = function() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    
    if (!firstName || !lastName) {
        showToast(
            enter_identification_message, 
            "linear-gradient(to right, lightcoral, lightblue)"
        );
        return;
    }

    user_identification = `${firstName}|${lastName}`;
    // Initialize storage with user info and empty answers array
    localStorage.setItem(localStorageKey, JSON.stringify({
        user_identification,
        currentQuestion: 0,
        answers: []
    }));
    
    document.getElementById('quiz').style.display = 'block';
    displayQuestion();
}

// Modify displayQuestion to not auto-start
function displayQuestion() {
    if (!user_identification) return;
    const question = questions[currentQuestion];
    
    // Update progress bar based on answered questions
    const currentProgress = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const answeredCount = (currentProgress.answers || []).length;
    const progress = (answeredCount / questions.length) * 100;
    
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `${Math.round(progress)}%`;
    
    const options = [
        question['answer_A'],
        question['answer_B'],
        question['answer_C'],
        question['answer_D']
    ];
    
    const quizContainer = document.getElementById('quiz');

    quizContainer.innerHTML = `
        <h2>Question ${currentQuestion + 1}</h2>
        <p>${question.question}</p>
        <div class="options">
            ${options.map((option, index) => `
                <div class="option" onclick="submitAnswer('${index}')">${option}</div>
            `).join('')}
        </div>
    `;

    if (display_png_questions) {
        // Wrap current content in a div for capturing
        const contentToCapture = quizContainer.innerHTML;
        quizContainer.innerHTML = `
            <div id="originalContent">${contentToCapture}</div>
            <div id="imageSnapshot"></div>
            <div id="genericAnswers"></div>
        `;
        
        // Capture the original content as an image
        html2canvas(document.getElementById('originalContent')).then(canvas => {
            // Get the 2D context of the canvas
            const ctx = canvas.getContext('2d');
            
            // Set up the watermark text
            ctx.fillStyle = 'rgba(200, 200, 200, 0.5)'; // semi-transparent white
            ctx.font = '16px Arial';
            
            // Add text multiple times across the canvas at different angles
            for (let i = 0; i < canvas.width; i += 200) {
                for (let j = 0; j < canvas.height; j += 50) {
                    ctx.save();
                    ctx.translate(i, j);
                    ctx.rotate(-0.4); // Slight angle
                    ctx.fillText(watermark_texts[Math.floor(Math.random() * watermark_texts.length)], 0, 0);                    ctx.restore();
                }
            }
            
            document.getElementById('imageSnapshot').appendChild(canvas);
        });

        // Remove the original content after capturing it as an image
        document.getElementById('originalContent').remove();

        document.getElementById('genericAnswers').innerHTML = `
            <div class="optionsPlain">
                ${options.map((option, index) => `
                    <div class="option" onclick="submitAnswer('${index}')">${String.fromCharCode(65 + index)}</div>
                `).join('')}
            </div>
        `;
    }
    updateQuestionList();
}

// Make submitAnswer global
window.submitAnswer = async function(selectedAnswer) {
    const question = questions[currentQuestion];
    
    try {
        if (enableSupabase) {
            const { data, error } = await supabaseClient
                .from('mcq')
                .insert([
                    {
                        question_id: question.id,
                        quizz_id: quizz_id,
                        answer_id: selectedAnswer,
                        identification: user_identification
                    }
                ]);

            if (error) throw error;
        }

        // Get current progress from localStorage
        const currentProgress = JSON.parse(localStorage.getItem(localStorageKey)) || {};
        
        // Check if this question was already answered
        const existingAnswerIndex = currentProgress.answers?.findIndex(a => a.question_id === question.id);
        if (existingAnswerIndex >= 0) {
            // Update existing answer
            currentProgress.answers[existingAnswerIndex] = {
                question_id: question.id,
                answer_id: selectedAnswer
            };
        } else {
            // Add new answer
            if (!currentProgress.answers) currentProgress.answers = [];
            currentProgress.answers.push({
                question_id: question.id,
                answer_id: selectedAnswer
            });
        }

        // Save updated progress
        localStorage.setItem(localStorageKey, JSON.stringify(currentProgress));

        if (currentProgress.answers.length >= questions.length) {
            // Quiz completed
            document.getElementById('quiz').innerHTML = '<h2>Quiz completed!</h2>';
            showToast(quiz_completed_message, "linear-gradient(to right, lightcoral, lightgreen)");
        } else {
            // Move to next unanswered question
            var nextUnanswered = questions.findIndex((q, index) => 
                index > currentQuestion && 
                !currentProgress.answers.some(a => a.question_id === q.id)
            );
            if (nextUnanswered == -1) {
                nextUnanswered = questions.findIndex((q, index) => 
                    index <= currentQuestion && 
                    !currentProgress.answers.some(a => a.question_id === q.id)
                );
            }
            currentQuestion = nextUnanswered >= 0 ? nextUnanswered : currentQuestion + 1;
            displayQuestion();
            showToast(`Answer to question ${currentQuestion} submitted!`, "linear-gradient(to right, lightblue, lightgreen)");
        }
        
        updateQuestionList();

    } catch (error) {
        console.error('Error submitting answer:', error);
        showToast(
            error_submitting_answer_message, 
            "linear-gradient(to right, lightcoral, lightblue)"
        );
    }
}

// Add these new functions
window.clearProgress = function() {
    if (confirm(clear_progress_message)) {
        localStorage.removeItem(localStorageKey);
        location.reload();
    }
}

window.downloadProgress = function() {
    const progress = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const dataStr = JSON.stringify(progress, null, 2);
    
    // Simple XOR cipher with a fixed key
    const scrambledStr = Array.from(dataStr)
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
        .join('');
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(scrambledStr);
    const exportName = `quiz_progress_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

function updateQuestionList() {
    const questionList = document.getElementById('question-list');
    const currentProgress = JSON.parse(localStorage.getItem(localStorageKey)) || {};
    const answeredQuestions = new Set(currentProgress.answers?.map(a => a.question_id) || []);
    
    questionList.innerHTML = questions.map((_, index) => `
        <div class="question-square ${index === currentQuestion ? 'active' : ''} 
                ${answeredQuestions.has(questions[index].id) ? 'answered' : ''}"
                onclick="jumpToQuestion(${index})">
            ${index + 1}
        </div>
    `).join('');
}

window.jumpToQuestion = function(index) {
    if (index >= 0 && index < questions.length) {
        currentQuestion = index;
        displayQuestion();
    }
}

let questions = [];
fetch(quizz_origin)
.then(response => response.json())
.then(data => {
    questions = data;
    shuffleQuestions(questions, generateSeed());
    displayQuestion();
});