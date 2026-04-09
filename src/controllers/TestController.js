import { QuizService } from '../services/QuizService.js';

export class TestController {
  constructor(appData) {
    this.appData = appData;
    
    this.questions = [];
    this.currentIndex = -1;
    this.score = 0;
    this.isAnswerConfirmed = false;
    this.progress = []; 

    // UI Elements
    this.startInput = document.getElementById('test-start-input');
    this.endInput = document.getElementById('test-end-input');
    this.countInput = document.getElementById('test-count-input');
    this.statusText = document.getElementById('test-status-text');

    this.testWorkspace = document.getElementById('test-workspace');
    this.questionText = document.getElementById('test-question-text');
    this.optionsContainer = document.getElementById('test-options-container');
    
    this.btnStart = document.getElementById('btn-test-start');
    this.btnRestart = document.getElementById('btn-test-restart');
    this.btnConfirm = document.getElementById('btn-test-confirm');
    this.btnNext = document.getElementById('btn-test-next');

    this.liveStats = document.getElementById('test-live-stats');
    this.navGrid = document.getElementById('test-navigation-grid');
    this.resultFeedback = document.getElementById('test-result-feedback');

    this.testImage = document.getElementById('test-image');
    this.testNoImg = document.getElementById('test-no-img');

    this.summaryPanel = document.getElementById('test-summary-panel');
    this.summaryText = document.getElementById('test-summary-text');

    this.init();
  }

  init() {
    this.startInput.value = 1;
    this.endInput.value = this.appData.length;
    this.countInput.value = Math.min(20, this.appData.length);

    this.btnStart.addEventListener('click', () => this.startTest());
    this.btnRestart.addEventListener('click', () => this.startTest());

    this.btnConfirm.addEventListener('click', () => this.confirmAnswer());
    this.btnNext.addEventListener('click', () => this.nextQuestion());
  }

  startTest() {
    let start = parseInt(this.startInput.value) - 1;
    let end = parseInt(this.endInput.value) - 1;
    let count = parseInt(this.countInput.value);

    let rangeCount = end - start + 1;
    if (isNaN(start) || isNaN(end) || isNaN(count) || 
        start < 0 || end >= this.appData.length || start > end || 
        count <= 0 || count > rangeCount) {
      alert(window.t ? window.t('test.alert.invalid_range') : `Phạm vi test không hợp lệ. Hãy kiểm tra lại.`);
      return;
    }

    this.questions = QuizService.generateTestQuestions(this.appData, start, end, count);
    this.currentIndex = 0;
    this.score = 0;
    this.progress = this.questions.map(() => ({ selectedIndex: -1, isCorrect: false, confirmed: false }));

    this.statusText.textContent = window.t ? window.t('test.status.in_progress') : "Trạng thái: Đang làm bài";
    this.testWorkspace.classList.remove('hidden');
    this.summaryPanel.classList.add('hidden');

    this.displayQuestion();
  }

  displayQuestion() {
    this.isAnswerConfirmed = this.progress[this.currentIndex].confirmed;
    const q = this.questions[this.currentIndex];

    this.questionText.textContent = `Câu ${this.currentIndex + 1}: ${q.description}`;
    this.resultFeedback.textContent = "";
    
    if (q.imageFileName) {
      this.testImage.src = `/Assets/Image/${q.imageFileName}`;
      this.testImage.classList.remove('hidden');
      this.testNoImg.classList.add('hidden');
    } else {
      this.testImage.classList.add('hidden');
      this.testNoImg.classList.remove('hidden');
    }

    this.renderOptions(q);
    this.updateStatsAndNav();

    if (this.isAnswerConfirmed) {
      this.btnConfirm.disabled = true;
      this.btnNext.disabled = false;
      this.showStoredFeedback();
    } else {
      this.btnConfirm.disabled = false;
      this.btnNext.disabled = true;
    }
  }

  renderOptions(q) {
    this.optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, idx) => {
      const lbl = document.createElement('label');
      lbl.className = 'radio-option';

      const inp = document.createElement('input');
      inp.type = 'radio';
      inp.name = 'test-opt';
      inp.value = idx;

      // Restore past selection
      if (this.isAnswerConfirmed && this.progress[this.currentIndex].selectedIndex === idx) {
        inp.checked = true;
      } else if (!this.isAnswerConfirmed && this.progress[this.currentIndex].selectedIndex === idx) {
         inp.checked = true; // User might have checked but not confirmed
      }

      if (this.isAnswerConfirmed) {
        inp.disabled = true;
      }

      inp.addEventListener('change', () => {
        if (!this.isAnswerConfirmed) {
           this.progress[this.currentIndex].selectedIndex = idx;
        }
      });

      const customDiv = document.createElement('div');
      customDiv.className = 'custom-radio';

      const txt = document.createElement('div');
      txt.className = 'radio-text';
      txt.textContent = `${letters[idx]}: ${opt.text}`;

      lbl.appendChild(inp);
      lbl.appendChild(customDiv);
      lbl.appendChild(txt);

      // Highlight logic if confirmed
      if (this.isAnswerConfirmed) {
        if (opt.isCorrect) {
           lbl.style.borderColor = 'var(--text-success)';
           lbl.style.color = 'var(--text-success)';
        } else if (this.progress[this.currentIndex].selectedIndex === idx && !opt.isCorrect) {
           lbl.style.borderColor = 'var(--text-error)';
           lbl.style.color = 'var(--text-error)';
        }
      }

      this.optionsContainer.appendChild(lbl);
    });
  }

  confirmAnswer() {
    const selectedIdx = this.progress[this.currentIndex].selectedIndex;
    if (selectedIdx === -1) {
      alert(window.t ? window.t('test.alert.choose_pls') : "Hãy chọn 1 đáp án trước khi xác nhận.");
      return;
    }

    this.isAnswerConfirmed = true;
    this.progress[this.currentIndex].confirmed = true;
    this.btnConfirm.disabled = true;
    this.btnNext.disabled = false;

    const q = this.questions[this.currentIndex];
    const isCorrect = q.options[selectedIdx].isCorrect;
    this.progress[this.currentIndex].isCorrect = isCorrect;

    if (isCorrect) {
      this.score++;
      this.resultFeedback.style.color = "var(--text-success)";
      this.resultFeedback.textContent = window.t ? window.t('test.correct') : "Đúng rồi!";
    } else {
      this.resultFeedback.style.color = "var(--text-error)";
      this.resultFeedback.textContent = (window.t ? window.t('test.incorrect') : "Sai.") + " -> " + q.correctAnswer;
    }

    // Re-render UI to freeze options and color them
    this.renderOptions(q);
    this.updateStatsAndNav();
  }

  showStoredFeedback() {
    const q = this.questions[this.currentIndex];
    const isCorrect = this.progress[this.currentIndex].isCorrect;
     if (isCorrect) {
      this.resultFeedback.style.color = "var(--text-success)";
      this.resultFeedback.textContent = window.t ? window.t('test.correct') : "Đúng rồi!";
    } else {
      this.resultFeedback.style.color = "var(--text-error)";
      this.resultFeedback.textContent = (window.t ? window.t('test.incorrect') : "Sai.") + " -> " + q.correctAnswer;
    }
  }

  nextQuestion() {
    if (this.currentIndex >= this.questions.length - 1) {
      this.showSummary();
      return;
    }
    this.currentIndex++;
    this.displayQuestion();
  }

  updateStatsAndNav() {
    let answered = 0;
    let correct = 0;
    let wrong = 0;

    this.navGrid.innerHTML = '';
    
    this.progress.forEach((p, idx) => {
      if (p.confirmed) {
        answered++;
        if (p.isCorrect) correct++;
        else wrong++;
      }

      const btn = document.createElement('button');
      btn.className = 'nav-indicator';
      btn.textContent = (idx + 1).toString();
      if (idx === this.currentIndex) btn.classList.add('active');
      if (p.confirmed) {
        btn.classList.add(p.isCorrect ? 'correct' : 'wrong');
      }

      btn.addEventListener('click', () => {
         this.currentIndex = idx;
         this.displayQuestion();
      });

      this.navGrid.appendChild(btn);
    });

    this.liveStats.textContent = window.t ? window.t('test.live_stats', this.questions.length, wrong, correct) : `Tổng số: ${this.questions.length} | Sai: ${wrong} | Đúng: ${correct}`;
  }

  showSummary() {
    this.testWorkspace.classList.add('hidden');
    this.summaryPanel.classList.remove('hidden');
    this.statusText.textContent = window.t ? window.t('test.status.finished') : "Trạng thái: Đã hoàn thành";

    const total = this.questions.length;
    const correct = this.score;
    const wrong = total - correct;
    const percent = ((correct / total) * 100).toFixed(1);

    this.summaryText.textContent = window.t ? window.t('test.summary', total, correct, wrong, percent) : `Kết quả: ${correct}/${total}`;
  }
}
