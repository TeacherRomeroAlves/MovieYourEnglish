window.BALLAD_LESSON = {
  before: [
    ['plot', 'Based on the trailer and your knowledge, which plot is correct?', [
      'Mr. Snow represents District 12 and has the difficult mission of organizing the Hunger Games to entertain the audience at home.',
      'Young Coriolanus Snow sees a chance to change his fortunes when he is chosen to participate in the Hunger Games to save his mother.',
      'Mr. Snow is assigned to mentor a young girl from District 12. As they develop a connection, they must also find a way to win the Hunger Games.'
    ], 2, 'Get ready for the beginning of a great story!'],
    ['mentor', 'He is my _______. He is responsible for giving me advice.', ['soldier', 'host', 'mentor', 'tribute'], 2, 'Is it easy to be a mentor?'],
    ['rebel', 'A person who does not follow rules and opposes authority is _______.', ['revolution', 'rebellion', 'a rebel', 'a rebellious'], 2, 'Are you a rebel?'],
    ['reap', 'Farmers ______ their crops at the end of the season.', ['plant', 'sow', 'reap', 'kill'], 2, 'Do you like growing plants?'],
    ['traitor', 'A _______ is a person who is not loyal.', ['tutor', 'classmate', 'traitor', 'competitor'], 2, 'Are you loyal to your friends?'],
    ['snakes', 'Some ______ can kill you with one bite! They are extremely _______.', ['scary – rats', 'songbirds – smart', 'snakes – venomous', 'drinks – dangerous'], 2, 'Are you afraid of snakes?'],
    ['handkerchief', 'A handkerchief is...', ['a soldier responsible for keeping the peace in a city.', 'a small piece of plastic used to clean blood.', 'a small piece of cloth used to wipe your nose, face, or tears.', 'a person responsible for creating games.'], 2, 'Do you have a handkerchief?']
  ],
  after: [
    ['motivation', 'What is Coriolanus’s initial motivation for winning the Games?', ['To impress the Head Gamemaker.', 'To prove his loyalty to District 10.', 'To restore his family’s prosperity.'], 2, 'Does Lucy change this motivation?'],
    ['handkerchief', 'Why is the handkerchief important for winning the Games?', ['The snakes do not attack Coriolanus because of his scent.', 'Dr. Gaul stops the Games because of the handkerchief.', 'It helps Lucy with the snakes.'], 2, 'Can you explain what happened?'],
    ['punishment', 'Why is Coriolanus punished?', ['He smuggled weapons.', 'He killed a tribute.', 'He cheated during the Games.'], 2, 'What is his sentence? Is it fair?'],
    ['escape', 'Why do Coriolanus and Lucy not escape together?', ['Because a snake bites Lucy.', 'Because Lucy kills Sejanus with a rifle.', 'Because Lucy knows he did something wrong.'], 2, 'What did he do? Was Lucy’s reaction right?'],
    ['highbottom', 'What does Casca Highbottom confess to Coriolanus at the end?', ['That the Games were Dr. Gaul’s idea.', 'That Crassus, Coriolanus’s father, led District 12.', 'That he came up with the Games while he was drunk.'], 2, 'Who stole his idea?']
  ],
  during: [
    'What are the Hunger Games?',
    'What is the Reaping?',
    'What is the Snow family’s situation?',
    'Who is Lucy? What is her talent?',
    'Who are Casca Highbottom and Dr. Volumnia Gaul? Are they important to the plot?',
    'What happens during and after the Games? Why?'
  ],
  preferences: [
    { id: 'danger', question: 'Would you rather participate in a deadly arena game or fight in a war?', options: [
      { label: 'An arena game', followUp: 'What would your strategy be?', emoji: '🏟️' },
      { label: 'A war', followUp: 'Why would you choose this option?', emoji: '🛡️' }
    ] },
    { id: 'honesty', question: 'Is it better to commit a crime to get food or live honestly in poverty?', options: [
      { label: 'Commit a crime to get food', followUp: 'What crime, if any, would be acceptable?', emoji: '🍞' },
      { label: 'Live honestly in poverty', followUp: 'What motivates you to be honest?', emoji: '⚖️' }
    ] },
    { id: 'guidance', question: 'Would you prefer to have a mentor or a pupil?', options: [
      { label: 'A mentor', followUp: 'Why? What would you want them to teach you?', emoji: '🧭' },
      { label: 'A pupil', followUp: 'What would you teach?', emoji: '📚' }
    ] }
  ]
};
