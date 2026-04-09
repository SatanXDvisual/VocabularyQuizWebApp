export class StudyController {
  constructor(appData) {
    this.appData = appData;
    this.currentIndex = 0;

    // UI Elements
    this.studyIndexInput = document.getElementById('study-index-input');
    this.studyTotalLabel = document.getElementById('study-total-label');
    this.btnSaveStudy = document.getElementById('btn-save-study');
    
    this.questionText = document.getElementById('study-question-text');
    this.answerText = document.getElementById('study-answer-text');
    this.feedbackText = document.getElementById('study-feedback');
    
    this.studyImage = document.getElementById('study-image');
    this.studyNoImg = document.getElementById('study-no-img');

    // Buttons
    this.btnRandom = document.getElementById('btn-study-random');
    this.btnPrev = document.getElementById('btn-study-prev');
    this.btnNext = document.getElementById('btn-study-next');

    this.init();
  }

  init() {
    this.studyTotalLabel.textContent = `/ ${this.appData.length}`;
    this.loadSavedState();
    this.displayCurrentItem();

    this.btnPrev.addEventListener('click', () => {
      this.currentIndex = (this.currentIndex - 1 + this.appData.length) % this.appData.length;
      this.displayCurrentItem();
    });

    this.btnNext.addEventListener('click', () => {
      this.currentIndex = (this.currentIndex + 1) % this.appData.length;
      this.displayCurrentItem();
    });

    this.btnRandom.addEventListener('click', () => {
      this.currentIndex = Math.floor(Math.random() * this.appData.length);
      this.displayCurrentItem();
    });

    this.btnSaveStudy.addEventListener('click', () => {
      localStorage.setItem('savedStudyIndex', this.currentIndex.toString());
      alert(window.t ? window.t('study.saved', this.currentIndex + 1) : `Đã lưu câu ${this.currentIndex + 1}.`);
    });

    this.studyIndexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = parseInt(this.studyIndexInput.value) - 1;
        if (val >= 0 && val < this.appData.length) {
          this.currentIndex = val;
          this.displayCurrentItem();
        } else {
          alert(`Vui lòng nhập số câu từ 1 đến ${this.appData.length}.`);
          this.studyIndexInput.value = this.currentIndex + 1;
        }
      }
    });

    this.studyIndexInput.addEventListener('blur', () => {
        const val = parseInt(this.studyIndexInput.value) - 1;
        if (val >= 0 && val < this.appData.length) {
          this.currentIndex = val;
          this.displayCurrentItem();
        } else {
          this.studyIndexInput.value = this.currentIndex + 1;
        }
    });
  }

  loadSavedState() {
    const saved = localStorage.getItem('savedStudyIndex');
    if (saved !== null) {
      const idx = parseInt(saved);
      if (idx >= 0 && idx < this.appData.length) {
        this.currentIndex = idx;
      }
    }
  }

  displayCurrentItem() {
    this.studyIndexInput.value = this.currentIndex + 1;
    this.feedbackText.textContent = "";

    const item = this.appData[this.currentIndex];
    this.questionText.textContent = item.Description;
    this.answerText.value = item.Answer;
    
    if (item.ImagePath) {
      this.studyImage.src = item.ImagePath;
      this.studyImage.classList.remove('hidden');
      this.studyNoImg.classList.add('hidden');
    } else {
      this.studyImage.classList.add('hidden');
      this.studyNoImg.classList.remove('hidden');
    }
  }
}
