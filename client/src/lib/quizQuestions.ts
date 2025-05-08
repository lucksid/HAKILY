// Database of quiz questions for the general knowledge quiz game

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOption: number; // Index of the correct option (0-based)
}

// Question categories
export type QuizCategory = 
  | "science" 
  | "history" 
  | "geography" 
  | "entertainment" 
  | "sports" 
  | "art" 
  | "literature" 
  | "technology";

// Collection of quiz questions by category
const quizQuestions: Record<QuizCategory, QuizQuestion[]> = {
  science: [
    {
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Au", "Ag", "Gd"],
      correctOption: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Jupiter", "Mars", "Saturn"],
      correctOption: 2
    },
    {
      question: "What is the hardest natural substance on Earth?",
      options: ["Diamond", "Titanium", "Quartz", "Platinum"],
      correctOption: 0
    },
    {
      question: "How many elements are in the periodic table?",
      options: ["92", "108", "118", "120"],
      correctOption: 2
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Brain", "Liver", "Heart", "Skin"],
      correctOption: 3
    }
  ],
  history: [
    {
      question: "In which year did World War II end?",
      options: ["1943", "1945", "1947", "1950"],
      correctOption: 1
    },
    {
      question: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"],
      correctOption: 2
    },
    {
      question: "The ancient city of Rome was built on how many hills?",
      options: ["Five", "Six", "Seven", "Nine"],
      correctOption: 2
    },
    {
      question: "In which year did the Titanic sink?",
      options: ["1910", "1912", "1915", "1920"],
      correctOption: 1
    },
    {
      question: "Which civilization built the Machu Picchu complex in Peru?",
      options: ["Aztec", "Maya", "Inca", "Olmec"],
      correctOption: 2
    }
  ],
  geography: [
    {
      question: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctOption: 2
    },
    {
      question: "Which is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
      correctOption: 3
    },
    {
      question: "How many continents are there in the world?",
      options: ["5", "6", "7", "8"],
      correctOption: 2
    },
    {
      question: "Which desert is the largest in the world?",
      options: ["Gobi", "Kalahari", "Sahara", "Antarctic"],
      correctOption: 3
    },
    {
      question: "Which country is home to the Great Barrier Reef?",
      options: ["New Zealand", "Australia", "Indonesia", "Philippines"],
      correctOption: 1
    }
  ],
  entertainment: [
    {
      question: "Who played the character of Harry Potter in the movie series?",
      options: ["Daniel Radcliffe", "Rupert Grint", "Emma Watson", "Tom Felton"],
      correctOption: 0
    },
    {
      question: "Which band performed the album 'The Dark Side of the Moon'?",
      options: ["The Beatles", "Led Zeppelin", "Pink Floyd", "The Rolling Stones"],
      correctOption: 2
    },
    {
      question: "In which year was the first episode of The Simpsons aired?",
      options: ["1987", "1989", "1991", "1993"],
      correctOption: 1
    },
    {
      question: "Who is known as the 'King of Pop'?",
      options: ["Elvis Presley", "Michael Jackson", "Prince", "David Bowie"],
      correctOption: 1
    },
    {
      question: "Which movie won the Academy Award for Best Picture in 2020?",
      options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
      correctOption: 2
    }
  ],
  sports: [
    {
      question: "In which sport would you perform a slam dunk?",
      options: ["Volleyball", "Basketball", "Tennis", "Football"],
      correctOption: 1
    },
    {
      question: "How many players are in a standard soccer team?",
      options: ["9", "10", "11", "12"],
      correctOption: 2
    },
    {
      question: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Argentina", "Italy", "Brazil"],
      correctOption: 3
    },
    {
      question: "In which Olympic sport would you perform a vault?",
      options: ["Swimming", "Gymnastics", "Track and Field", "Diving"],
      correctOption: 1
    },
    {
      question: "What is the diameter of a basketball hoop in inches?",
      options: ["16", "18", "20", "22"],
      correctOption: 1
    }
  ],
  art: [
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correctOption: 2
    },
    {
      question: "Which art movement is Salvador Dalí associated with?",
      options: ["Impressionism", "Cubism", "Surrealism", "Pop Art"],
      correctOption: 2
    },
    {
      question: "In which city is the Louvre Museum located?",
      options: ["Rome", "Paris", "London", "Madrid"],
      correctOption: 1
    },
    {
      question: "Which famous artist cut off his own ear?",
      options: ["Pablo Picasso", "Claude Monet", "Vincent van Gogh", "Edvard Munch"],
      correctOption: 2
    },
    {
      question: "Who sculpted the statue of David?",
      options: ["Leonardo da Vinci", "Donatello", "Michelangelo", "Raphael"],
      correctOption: 2
    }
  ],
  literature: [
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
      correctOption: 2
    },
    {
      question: "What is the first book in J.K. Rowling's Harry Potter series?",
      options: ["Harry Potter and the Goblet of Fire", "Harry Potter and the Philosopher's Stone", "Harry Potter and the Chamber of Secrets", "Harry Potter and the Prisoner of Azkaban"],
      correctOption: 1
    },
    {
      question: "Who wrote '1984'?",
      options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "H.G. Wells"],
      correctOption: 0
    },
    {
      question: "Which novel begins with the line 'Call me Ishmael'?",
      options: ["The Great Gatsby", "Moby Dick", "The Catcher in the Rye", "To Kill a Mockingbird"],
      correctOption: 1
    },
    {
      question: "Who is the author of 'The Lord of the Rings'?",
      options: ["C.S. Lewis", "J.R.R. Tolkien", "George R.R. Martin", "Roald Dahl"],
      correctOption: 1
    }
  ],
  technology: [
    {
      question: "Who is the co-founder of Microsoft?",
      options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
      correctOption: 1
    },
    {
      question: "What does 'HTTP' stand for?",
      options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Hyper Transfer Text Protocol", "Home Tool Transfer Protocol"],
      correctOption: 0
    },
    {
      question: "In what year was the first iPhone released?",
      options: ["2005", "2007", "2009", "2010"],
      correctOption: 1
    },
    {
      question: "What does 'CPU' stand for?",
      options: ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"],
      correctOption: 2
    },
    {
      question: "Which programming language was developed by James Gosling at Sun Microsystems?",
      options: ["Python", "JavaScript", "C++", "Java"],
      correctOption: 3
    }
  ]
};

// Get a random question
export function getRandomQuestion(): QuizQuestion {
  // Get a random category
  const categories = Object.keys(quizQuestions) as QuizCategory[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Get a random question from that category
  const questions = quizQuestions[randomCategory];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Get a random question from a specific category
export function getRandomQuestionFromCategory(category: QuizCategory): QuizQuestion {
  const questions = quizQuestions[category];
  return questions[Math.floor(Math.random() * questions.length)];
}

// Get all categories
export function getAllCategories(): QuizCategory[] {
  return Object.keys(quizQuestions) as QuizCategory[];
}

// Get all questions for a specific category
export function getQuestionsForCategory(category: QuizCategory): QuizQuestion[] {
  return quizQuestions[category];
}

// Get a set of questions for a quiz (mix of categories)
export function getQuestionsForQuiz(count: number = 5): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const categories = Object.keys(quizQuestions) as QuizCategory[];
  
  // Try to get an even distribution of categories
  const questionsPerCategory = Math.ceil(count / categories.length);
  
  for (const category of categories) {
    const categoryQuestions = quizQuestions[category];
    
    // Get random questions from this category
    const randomIndices = new Set<number>();
    while (randomIndices.size < questionsPerCategory && randomIndices.size < categoryQuestions.length) {
      randomIndices.add(Math.floor(Math.random() * categoryQuestions.length));
    }
    
    // Add those questions to our selection
    for (const index of randomIndices) {
      questions.push(categoryQuestions[index]);
      
      // If we have enough questions, stop
      if (questions.length >= count) {
        break;
      }
    }
    
    // If we have enough questions, stop
    if (questions.length >= count) {
      break;
    }
  }
  
  // Shuffle the questions
  return questions.sort(() => Math.random() - 0.5);
}
