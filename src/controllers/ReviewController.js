import { QuizService } from '../services/QuizService.js';

export class ReviewController {
  constructor(appData) {
    this.appData = appData;
    
    this.startIndex = 0;
    this.endIndex = appData.length - 1;
    this.currentIndex = 0;

    // UI Elements
    this.progressText = document.getElementById('review-progress-text');
    this.startInput = document.getElementById('review-start-input');
    this.endInput = document.getElementById('review-end-input');
    
    this.questionText = document.getElementById('review-question-text');
    this.answerInput = document.getElementById('review-answer-input');
    this.feedbackText = document.getElementById('review-feedback');
    this.realAnswerText = document.getElementById('review-real-answer');
    
    this.reviewImage = document.getElementById('review-image');
    this.reviewNoImg = document.getElementById('review-no-img');

    // Buttons
    this.btnCheck = document.getElementById('btn-review-check');
    this.btnShow = document.getElementById('btn-review-show');
    this.btnRandom = document.getElementById('btn-review-random');
    this.btnPrev = document.getElementById('btn-review-prev');
    this.btnNext = document.getElementById('btn-review-next');

    this.init();
  }

  init() {
    this.startInput.value = 1;
    this.endInput.value = this.appData.length;
    
    this.applyRange();
    this.displayCurrentItem();

    // Event listeners
    this.startInput.addEventListener('change', () => this.applyRange());
    this.endInput.addEventListener('change', () => this.applyRange());

    this.btnPrev.addEventListener('click', () => {
      const rangeLen = this.endIndex - this.startIndex + 1;
      this.currentIndex--;
      if (this.currentIndex < this.startIndex) {
        this.currentIndex = this.startIndex + rangeLen - 1;
      }
      this.displayCurrentItem();
    });

    this.btnNext.addEventListener('click', () => {
      this.currentIndex++;
      if (this.currentIndex > this.endIndex) {
        this.currentIndex = this.startIndex;
      }
      this.displayCurrentItem();
    });

    this.btnRandom.addEventListener('click', () => {
      const rangeLen = this.endIndex - this.startIndex + 1;
      this.currentIndex = this.startIndex + Math.floor(Math.random() * rangeLen);
      this.displayCurrentItem();
    });

    this.btnCheck.addEventListener('click', () => {
      const userAnswer = this.answerInput.value;
      if (!userAnswer.trim()) {
        alert("Bạn hãy nhập đáp án trước khi kiểm tra.");
        return;
      }

      const item = this.appData[this.currentIndex];
      const isCorrect = QuizService.isAnswerCorrect(item.Answer, userAnswer);
      
      this.feedbackText.style.color = isCorrect ? "var(--text-success)" : "var(--text-error)";
      this.feedbackText.textContent = isCorrect ? window.t('review.correct') : window.t('review.incorrect');
    });

    this.btnShow.addEventListener('click', () => {
      const item = this.appData[this.currentIndex];
      this.realAnswerText.classList.remove('hidden');
      this.realAnswerText.textContent = window.t ? window.t('review.real_answer', item.Answer) : `Đáp án: ${item.Answer}`;
    });
  }

  applyRange() {
    let start = parseInt(this.startInput.value) - 1;
    let end = parseInt(this.endInput.value) - 1;

    if (isNaN(start) || isNaN(end) || start < 0 || end >= this.appData.length || start > end) {
      alert(window.t ? window.t('test.alert.invalid_range') : `Vui lòng nhập khoảng câu hợp lệ từ 1 đến ${this.appData.length}.`);
      this.startInput.value = this.startIndex + 1;
      this.endInput.value = this.endIndex + 1;
      return;
    }

    this.startIndex = start;
    this.endIndex = end;

    if (this.currentIndex < this.startIndex || this.currentIndex > this.endIndex) {
      this.currentIndex = this.startIndex;
      this.displayCurrentItem();
    }
  }

  displayCurrentItem() {
    this.progressText.textContent = `${window.t ? window.t('review.progress') : 'Tiến độ: '}${this.currentIndex + 1}/${this.appData.length}`;
    this.feedbackText.textContent = "";
    this.realAnswerText.classList.add('hidden');
    this.answerInput.value = "";

    const item = this.appData[this.currentIndex];
    this.questionText.textContent = item.Description;
    
    if (item.ImagePath) {
      this.reviewImage.src = item.ImagePath;
      this.reviewImage.classList.remove('hidden');
      this.reviewNoImg.classList.add('hidden');
    } else {
      this.reviewImage.classList.add('hidden');
      this.reviewNoImg.classList.remove('hidden');
    }
  }
}
