// Initialize Supabase client

// SUPABASE INFORMATION
const enableSupabase = false;
const supabase_url = 'https://XXX.supabase.co'
const supabase_key = 'eyXXX'

// QUIZ INFORMATION
const quizz_id = 'qcm_ecc_2024_ieP6caishae6wiicheez';
const quizz_origin = 'data/qcm.json';

// Display PNG questions to avoid copy pasting questions in chatgpt (not perfect)
const display_png_questions = false;

// Scrambling key
const key = 'QUIZ_KEY_2024';

const localStorageKey = 'quizProgress';

const enter_identification_message = "Please enter both first name and last name";
const quiz_completed_message = "Quiz completed! Download the results and send them to your_instructor@domain.com";
const error_submitting_answer_message = "There was an error submitting your answer. Please try again.";
const clear_progress_message = "Are you sure you want to clear all progress? This cannot be undone.";

const watermark_texts = [
    "Do not leak data from the quiz",
    "Do not leak quiz data",
    "Please do not leak quiz data",
    "Quiz data should not be leaked",
    "Avoid leaking quiz data",
    "Keep quiz data confidential",
    "Do not share quiz data",
    "Protect quiz data from leaks",
    "Do not distribute quiz data",
    "Respect the integrity of the quiz by not leaking data"
]