import * as XLSX from 'xlsx';
import { AuthController } from './controllers/AuthController.js';
import { StudyController } from './controllers/StudyController.js';
import { ReviewController } from './controllers/ReviewController.js';
import { TestController } from './controllers/TestController.js';
import { I18nService } from './services/I18nService.js';

let appData = [];
let studyController, reviewController, testController;
let i18n;

const globalLoading = document.getElementById('global-loading');

document.addEventListener('DOMContentLoaded', () => {
  // Init language
  i18n = new I18nService();
  i18n.init();

  // Initialize AuthController. When auth succeeds, load data.
  new AuthController(async () => {
    await loadExcelData();
    initTabs();
  });
});

async function loadExcelData() {
  globalLoading.classList.remove('hidden');
  try {
    const response = await fetch('/Assets/Data.xlsx');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // Parse it with SheetJS
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    appData = [];

    // Process rows (skip row 0 if it's headers or just read from start, WPF C# had 1-based logic)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length < 2) continue;

      const description = (row[0] || '').toString().trim();
      const answer = (row[1] || '').toString().trim();

      // Image is in Col 3, 6, or 5 in 1-based indexing => so array index 2, 5, or 4
      const imageFileName = (row[2] || row[5] || row[4] || '').toString().trim();

      if (shouldSkipRow(description, answer)) continue;

      appData.push({
        Description: description,
        Answer: answer,
        ImageFileName: imageFileName !== '' ? imageFileName : null,
        ImagePath: imageFileName !== '' ? `/Assets/Image/${imageFileName}` : null
      });
    }

    if (appData.length === 0) {
      alert("Không đọc được dữ liệu hợp lệ từ Excel.");
    }

    // Initialize Controllers
    studyController = new StudyController(appData);
    reviewController = new ReviewController(appData);
    testController = new TestController(appData);

  } catch (error) {
    console.error(error);
    alert("Không thể tải tệp Excel dữ liệu. Chi tiết trong Console.");
  } finally {
    globalLoading.classList.add('hidden');
  }
}

function shouldSkipRow(description, answer) {
  if (!description || !answer) return true;
  if (description.startsWith('//') || answer.startsWith('//')) return true;

  const metaValues = ["title", "alternatives", "context", "primaryLang", "entryType"];
  const descLower = description.toLowerCase();
  const ansLower = answer.toLowerCase();

  return metaValues.some(m => m.toLowerCase() === descLower || m.toLowerCase() === ansLower);
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
}
