import { db } from '../firebase/config.js';
import { doc, getDoc, setDoc } from "firebase/firestore";

export class AuthController {
  constructor(onAuthSuccess) {
    this.onAuthSuccess = onAuthSuccess;

    // Elements
    this.loginContainer = document.getElementById('login-container');
    this.appContainer = document.getElementById('app-container');
    this.loginForm = document.getElementById('login-form');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    this.loginError = document.getElementById('login-error');
    this.btnTryFree = document.getElementById('btn-try-free');
    this.trialEndedAlert = document.getElementById('trial-ended-alert');

    this.trialTimerHud = document.getElementById('trial-timer-hud');
    this.trialTimeLeftSpan = document.getElementById('trial-time-left');
    this.togglePasswordBtn = document.getElementById('toggle-password');

    this.trialInterval = null;
    this.TRIAL_DURATION_SEC = 10 * 60; // 10 minutes

    // Hardcoded accounts
    this.accounts = [
      { u: "admin", p: "1112223456" },
      { u: "user1", p: "K9v#2LmP" },
      { u: "user2", p: "rT7@qX1z" },
      { u: "user3", p: "N4m!8ByQ" },
      { u: "user4", p: "cW3$Lp9A" },
      { u: "user5", p: "Zx6&nR2k" },
      { u: "user6", p: "M1@vT8pJ" },
      { u: "user7", p: "qP5#yH3m" },
      { u: "user8", p: "L8!cD1wS" },
      { u: "user9", p: "tR2$kN7x" },
      { u: "user10", p: "B4@zQ9eM" },
      { u: "user11", p: "mX7&uJ2p" },
      { u: "user12", p: "H3#vK8rT" },
      { u: "user13", p: "pN1!sW6y" },
      { u: "user14", p: "D9@fL4qZ" },
      { u: "user15", p: "wK2$hM7c" },
      { u: "user16", p: "Y5&nP3tR" },
      { u: "user17", p: "gT8#xB1v" },
      { u: "user18", p: "Q6!mC9kL" },
      { u: "user19", p: "sJ4@rW2n" },
      { u: "user20", p: "V1$yH7pD" },
      { u: "manager", p: "X8#qL3mN" }
    ];

    this.init();
  }

  init() {
    this.checkTrialLock();

    this.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    this.btnTryFree.addEventListener('click', () => {
      this.startTrialMode();
    });

    if (this.togglePasswordBtn) {
      this.togglePasswordBtn.addEventListener('click', () => {
        const isPassword = this.passwordInput.getAttribute('type') === 'password';
        this.passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        if (isPassword) {
            this.togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            this.togglePasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      });
    }
  }

  checkTrialLock() {
    const hasUsedTrial = localStorage.getItem('hasUsedTrial');
    if (hasUsedTrial === 'true') {
      this.btnTryFree.disabled = true;
      this.btnTryFree.textContent = window.t ? window.t('auth.trial_exhausted') : "Bạn đã hết lượt dùng thử";
    }
  }

  handleLogin() {
    const u = this.usernameInput.value.trim();
    const p = this.passwordInput.value.trim();

    this.loginError.classList.add('hidden');
    this.trialEndedAlert.classList.add('hidden');

    const isValid = this.accounts.some(acc => acc.u === u && acc.p === p);

    if (isValid) {
      this.grantAccess(false);
    } else {
      this.loginError.classList.remove('hidden');
    }
  }

  async startTrialMode() {
    if (localStorage.getItem('hasUsedTrial') === 'true') {
      return;
    }

    this.btnTryFree.disabled = true;
    this.btnTryFree.textContent = window.t ? window.t('auth.checking_ip') : "Đang kiểm tra IP mạng...";

    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;

      const ipDocRef = doc(db, 'used_trials', ip);
      const ipDoc = await getDoc(ipDocRef);

      if (ipDoc.exists()) {
        const data = ipDoc.data();
        if (data && data.timestamp) {
            const startTime = new Date(data.timestamp).getTime();
            const now = new Date().getTime();
            const elapsedSec = Math.floor((now - startTime) / 1000);
            const MAX_TRIAL_SEC = 10 * 60;

            if (elapsedSec >= MAX_TRIAL_SEC) {
                localStorage.setItem('hasUsedTrial', 'true');
                this.btnTryFree.textContent = window.t ? window.t('auth.trial_exhausted') : "IP của bạn đã hết lượt dùng thử!";
                alert(window.t ? window.t('auth.ip_rejected') : "Từ chối: Địa chỉ IP mạng của bạn đã dùng hết 10 phút dùng thử.");
                return;
            } else {
                // Tiếp tục thời gian còn lại
                this.TRIAL_DURATION_SEC = MAX_TRIAL_SEC - elapsedSec;
            }
        }
      } else {
        await setDoc(ipDocRef, { timestamp: new Date().toISOString() });
        this.TRIAL_DURATION_SEC = 10 * 60;
      }
    } catch (error) {
      console.warn("Lỗi kiểm tra Firebase (có thể do bạn chưa sửa file firebase/config.js). Cho qua tạm thời...", error);
    }

    this.btnTryFree.textContent = window.t('login.try_free');
    this.grantAccess(true);
  }

  grantAccess(isTrial) {
    this.loginContainer.classList.add('hidden');
    this.appContainer.classList.remove('hidden');

    if (isTrial) {
      this.trialTimerHud.classList.remove('hidden');
      this.startTimer();
    } else {
      this.trialTimerHud.classList.add('hidden');
      if (this.trialInterval) clearInterval(this.trialInterval);
    }

    // Call callback to init application data
    if (this.onAuthSuccess) {
      this.onAuthSuccess();
    }
  }

  startTimer() {
    let timeLeft = this.TRIAL_DURATION_SEC;
    this.updateTimerUI(timeLeft);

    this.trialInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(this.trialInterval);
        this.endTrial();
      } else {
        this.updateTimerUI(timeLeft);
      }
    }, 1000);
  }

  updateTimerUI(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    this.trialTimeLeftSpan.textContent = `${m}:${s}`;
  }

  endTrial() {
    // Lockout
    localStorage.setItem('hasUsedTrial', 'true');

    // Swap UI back
    this.appContainer.classList.add('hidden');
    this.loginContainer.classList.remove('hidden');

    this.trialEndedAlert.classList.remove('hidden');
    this.btnTryFree.disabled = true;
    this.btnTryFree.textContent = window.t ? window.t('auth.trial_exhausted') : "Bạn đã hết lượt dùng thử";
  }
}
