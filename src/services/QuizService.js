export class QuizService {
  static isAnswerCorrect(expected, actual) {
    if (!expected || !actual) return false;
    
    // Normalize string: Trim and lowercase
    const cleanExpected = expected.trim().toLowerCase();
    const cleanActual = actual.trim().toLowerCase();
    
    return cleanExpected === cleanActual;
  }

  static generateTestQuestions(items, startIndex, endIndex, count) {
    const rangeItems = items.slice(startIndex, endIndex + 1);
    const selectedItems = this.getRandomItems(rangeItems, count);
    
    const questions = [];
    
    for (const item of selectedItems) {
      // Correct option
      const options = [
        { text: item.Answer, isCorrect: true }
      ];

      // Grab 3 random incorrect answers from the entire pool
      const wrongAnswers = this.getRandomItems(items.filter(i => i !== item), 3)
                               .map(i => ({ text: i.Answer, isCorrect: false }));
      
      options.push(...wrongAnswers);
      
      // Shuffle options
      this.shuffleArray(options);

      questions.push({
        description: item.Description,
        imageFileName: item.ImageFileName,
        options: options,
        correctAnswer: item.Answer
      });
    }

    return questions;
  }

  static getRandomItems(array, count) {
    const shuffled = [...array];
    this.shuffleArray(shuffled);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
