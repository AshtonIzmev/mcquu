# Quiz Application

A secure web-based quiz application designed for conducting assessments with anti-cheating measures and progress tracking capabilities.

## Features

- **User Authentication**: Students enter their first and last names before starting the quiz
- **Progress Tracking**: 
  - Automatic progress saving using localStorage
  - Visual progress bar showing completion percentage
  - Question navigation grid for easy movement between questions
  - Download progress functionality for submission

- **Anti-Cheating Measures**:
  - Question randomization with browser-specific seeding
  - Optional PNG rendering of questions with watermarks
  - Data scrambling for downloaded progress files
  - Watermark texts discouraging data leaks

- **Quiz Interface**:
  - Multiple choice questions with 4 options (A, B, C, D)
  - Clear visual feedback for answered questions
  - Option to jump between questions
  - Progress persistence across browser sessions

- **Administrative Features**:
  - Optional Supabase backend integration for answer tracking
  - Progress clearing functionality
  - Answer scoring system (via Jupyter notebook)
  - Progress download in encrypted format

## Technical Stack

- **Frontend**:
  - HTML5
  - CSS (Bootstrap)
  - JavaScript (Vanilla)
  - html2canvas for PNG rendering
  
- **Storage**:
  - Browser localStorage for progress
  - Optional Supabase integration
  
- **Libraries**:
  - Bootstrap
  - Toastify for notifications
  - html2canvas for question rendering
  - Supabase client (optional, used as a backup for student who did not send their results)

## Setup

1. Configure `constants.js` with your settings:
   - Set `enableSupabase` and Supabase credentials if using backend
   - Configure quiz ID and data source
   - Set display options and security keys

2. Place your quiz data in `data/qcm.json` following the format:
   ```json
   {
     "id": number,
     "question": string,
     "answer_A": string,
     "answer_B": string,
     "answer_C": string,
     "answer_D": string,
     "correct_answer": "A"|"B"|"C"|"D" //this field should not be present in data/qcm.json but is needed in the the notebook directory to evaluate the students
   }
   ```

## Scoring

The included Jupyter notebook (`tmp.ipynb`) provides functionality to:
- Decrypt student submissions
- Score answers against correct solutions
- Generate performance reports

## Security Features

- Question randomization unique to each browser
- Optional PNG rendering with watermarks
- XOR encryption for downloaded progress
- Anti-leak watermarks in rendered questions

## Usage

1. Students enter their identification
2. Answer questions in any order
3. Download progress file when complete
4. Submit encrypted progress file to instructor
5. Instructor uses notebook to decrypt and score submissions

## License

MIT