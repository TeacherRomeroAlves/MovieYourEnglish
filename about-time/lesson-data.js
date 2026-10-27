window.ABOUT_TIME_LESSON = {
  before: [
    ['plot', 'Based on the trailer and your knowledge, which plot is correct?', [
      'A young man discovers his family can travel forward in time. Now he will try his best to marry multiple women.',
      'A young woman discovers the men in her family can travel through time. Now she asks her brother to help her find a boyfriend.',
      'A young man discovers the men in his family can travel through time. He cannot change history, but he can change what happens in his life.'
    ], 2, 'Get ready for a movie about TIME!'],
    ['time-travel', 'If I could _______, I would visit ancient Egypt.', ['traveling', 'traveled time', 'time travel', 'time traveler'], 2, 'Where would you go if you could time travel?'],
    ['blind-date', 'A blind date is...', ['someone who cannot see.', 'a romantic meeting between two children who study together.', 'a romantic meeting between two people who have never met before.', 'a situation where two people fall in love quickly.'], 2, 'Is it an interesting situation?'],
    ['kate-moss', '_______ was one of the most famous fashion supermodels in the world.', ['Helen of Troy', 'Adolf Hitler', 'Kate Moss', 'KitKat'], 2, 'Do you know Kate Moss?'],
    ['wedding', 'A ceremony where two people get married is...', ['a car accident', 'a groom', 'a wedding', 'a bride'], 2, 'Are you married? How was your wedding?'],
    ['playwright', 'A person who writes plays to be performed in a theater is ______.', ['a publisher', 'a lawyer', 'a playwright', 'a best man'], 2, 'Which of these roles would you prefer?'],
    ['butterfly', 'The butterfly effect is...', ['the idea that everything wrong now will be better in the future.', 'the idea that a very small action helps people work better.', 'the idea that a very small change can cause big and unexpected results in the future.', 'the idea that a butterfly can cause time travel.'], 2, 'Can you think of a small decision that changed your life?']
  ],
  after: [
    ['tim', 'Who is Tim?', ['James’s father.', 'Charlotte’s brother.', 'Kit Kat’s brother.'], 2, 'Does he have a good family?'],
    ['father', 'What does Tim’s father tell him when he turns 21?', ['That his uncle has Alzheimer’s disease.', 'That his sister has superpowers.', 'That he can travel through time.'], 2, 'What is Tim’s reaction?'],
    ['london', 'Why does Tim move to London?', ['To write theater plays.', 'To become a table tennis player.', 'To pursue a career as a lawyer.'], 2, 'Who “helps” him in London?'],
    ['mary', 'Who is Mary?', ['A girl who hates Kate Moss.', 'An annoying coworker.', 'An American girl he meets on a blind date.'], 2, 'What is the beginning of their relationship like?'],
    ['marriage', 'Later in the movie, Tim and Mary...', ['have a terrible relationship.', 'have five children.', 'get married.'], 2, 'Are they happy together?'],
    ['kitkat', 'What is the problem with Kit Kat?', ['Her boyfriend is a great man.', 'Charlotte destroys her career.', 'She has a difficult life.'], 2, 'What happens to her? How does Tim help her?'],
    ['ending', 'What happens at the end of the movie?', ['Tim and Mary get divorced.', 'Tim decides to keep visiting his father forever.', 'Tim decides not to travel through time again.'], 2, 'What happened to his father? Did his father influence his decision?']
  ],
  during: [
    'Who is Tim? How old is he? Is he an ordinary man?',
    'What is Tim’s family like? Are they nice?',
    'Why does he move?',
    'Who is Mary? How is she important to the story?',
    'What are the consequences of Tim’s decisions?',
    'What is the message of the movie?'
  ],
  preferences: [
    { id: 'powers', question: 'Would you prefer to travel through time or teleport?', options: [
      { label: 'Travel through time', followUp: 'Would you use this ability a lot?', emoji: '⏳' },
      { label: 'Teleport', followUp: 'Where would you go right now?', emoji: '✨' }
    ] },
    { id: 'dreams', question: 'Would you rather meet the love of your life or have your dream job?', options: [
      { label: 'Meet the love of my life', followUp: 'What if you had no money?', emoji: '❤️' },
      { label: 'Have my dream job', followUp: 'What if you were alone for the rest of your life?', emoji: '💼' }
    ] },
    { id: 'life', question: 'Would you prefer a long, quiet life or a short, intense life?', options: [
      { label: 'A long, quiet life', followUp: 'How long would you like to live?', emoji: '🌿' },
      { label: 'A short, intense life', followUp: 'Would you be comfortable with the possibility of dying young? Why or why not?', emoji: '🔥' }
    ] }
  ]
};
