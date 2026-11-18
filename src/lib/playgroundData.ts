import {
  VideoEpisode,
  LearningItem,
  FlashcardItem,
  WorkbookItem,
  ChildProfile,
  StoryBook,
  CollectorWord,
} from '@/types';

// ==========================================
// 1. DEFAULT CHILD & PARENT PROFILE STATS
// ==========================================
export const DEFAULT_CHILD_PROFILE: ChildProfile = {
  id: 'child-1',
  name: 'Leo',
  avatarEmoji: '🦁',
  dailyLimitMinutes: 30,
  bedtimeHour: 19,
  bedtimeMinute: 30,
  unlockedStickerIds: ['sticker-sun', 'sticker-lion', 'sticker-cat'],
  totalTimeMinutes: 20,
  unlockedEpisodeIds: ['ep-1'],
  wordsLearnedCount: 24,
  accuracyScore: 96,
  dayStreak: 5,
  earnedKeysCount: 1,
};

// ==========================================
// 2. STITCH STORYBOOKS & GOLDEN KEYS
// ==========================================
export const STITCH_STORIES: StoryBook[] = [
  {
    id: 'story-barnaby',
    title: "Barnaby's Sky Deck",
    subtitle: 'Starlit Airship Chapter 2',
    genre: 'Adventure',
    level: 'Level 2 · Early Explorer',
    readTime: '6 min read',
    description:
      'Pilot Barnaby steers his brass-trimmed wooden airship through a starry midnight sky to greet friendly creatures made of drifting clouds.',
    icon: 'flight',
    gradient: 'from-[#121c36] via-[#1e315c] to-[#264b75]',
    keysEarned: 1,
    totalKeys: 3,
    sentence: {
      prefix: '“The gentle cloud',
      targetWord: 'creatures',
      suffix: 'floated across the shimmering starlight.”',
      phonicsClue: 'Plural noun with two syllables: crea • tures',
      wordChoices: [
        { word: 'whistle', syllables: 'whis • tle', isCorrect: false },
        { word: 'creatures', syllables: 'crea • tures', isCorrect: true, hint: '★ MATCH' },
        { word: 'blimp', syllables: '1 syllable', isCorrect: false },
      ],
    },
  },
  {
    id: 'story-willow',
    title: 'The Whispering Willow',
    subtitle: 'Enchanted Forest Chapter 1',
    genre: 'Fantasy',
    level: 'Level 1 · Beginner',
    readTime: '5 min read',
    description:
      'Milo follows tiny glowing fireflies down a mossy garden path to an ancient humming lantern tree full of friendly owls.',
    icon: 'park',
    gradient: 'from-[#261b47] to-[#1e4b4f]',
    keysEarned: 0,
    totalKeys: 3,
    sentence: {
      prefix: '“Tiny golden',
      targetWord: 'fireflies',
      suffix: 'blinked softly along the mossy garden path.”',
      phonicsClue: 'Compound word with two syllables: fire • flies',
      wordChoices: [
        { word: 'fireflies', syllables: 'fire • flies', isCorrect: true, hint: '★ MATCH' },
        { word: 'lantern', syllables: 'lan • tern', isCorrect: false },
        { word: 'breeze', syllables: '1 syllable', isCorrect: false },
      ],
    },
  },
  {
    id: 'story-pip',
    title: "Captain Pip's Coral Reef",
    subtitle: 'Deep Blue Bay Exploration',
    genre: 'Science',
    level: 'Level 2 · Early Explorer',
    readTime: '7 min read',
    description:
      'Join Pip the otter scientist inside her yellow submarine as she documents glowing coral towers and baby starfish.',
    icon: 'scuba_diving',
    gradient: 'from-[#38B6FF] to-[#084b73]',
    keysEarned: 0,
    totalKeys: 3,
    sentence: {
      prefix: '“Captain Pip spun the brass',
      targetWord: 'compass',
      suffix: 'to find the hidden underwater reef.”',
      phonicsClue: 'Two syllable tool word: com • pass',
      wordChoices: [
        { word: 'anchor', syllables: 'an • chor', isCorrect: false },
        { word: 'compass', syllables: 'com • pass', isCorrect: true, hint: '★ MATCH' },
        { word: 'splash', syllables: '1 syllable', isCorrect: false },
      ],
    },
  },
  {
    id: 'story-luna',
    title: "Luna's Clockwork Moon",
    subtitle: 'Sky Workshop Mysteries',
    genre: 'Adventure',
    level: 'Level 3 · Curious Reader',
    readTime: '8 min read',
    description:
      'Young inventor Luna climbs a tall brass ladder into the clouds to polish and wind the moon’s shining golden gears.',
    icon: 'settings',
    gradient: 'from-[#1b1838] to-[#3b2667]',
    keysEarned: 0,
    totalKeys: 3,
    sentence: {
      prefix: '“Luna gently oiled the golden',
      targetWord: 'gears',
      suffix: 'so the night sky would sparkle softly.”',
      phonicsClue: 'Plural mechanical noun: gears',
      wordChoices: [
        { word: 'ladder', syllables: 'lad • der', isCorrect: false },
        { word: 'sparks', syllables: '1 syllable', isCorrect: false },
        { word: 'gears', syllables: '1 syllable', isCorrect: true, hint: '★ MATCH' },
      ],
    },
  },
];

// ==========================================
// 3. STITCH WORD COLLECTOR & PHONICS CHEST
// ==========================================
export const COLLECTOR_WORDS_DATA: CollectorWord[] = [
  {
    id: 'cw-1',
    word: 'creatures',
    syllables: 'crea • tures',
    phonics: '/kree-churz/',
    sentence: 'The gentle cloud creatures floated across the shimmering starlight.',
    storyTitle: "Barnaby's Sky Deck",
    theme: 'Nature & Sky · Noun',
    isCollected: true,
  },
  {
    id: 'cw-2',
    word: 'compass',
    syllables: 'com • pass',
    phonics: '/kum-pus/',
    sentence: 'Barnaby polished his brass compass before lifting off into the clouds.',
    storyTitle: "Barnaby's Sky Deck",
    theme: 'Tools & Travel · Noun',
    isCollected: true,
  },
  {
    id: 'cw-3',
    word: 'fireflies',
    syllables: 'fire • flies',
    phonics: '/fyr-flyz/',
    sentence: 'Tiny golden fireflies blinked softly along the mossy garden path.',
    storyTitle: 'The Whispering Willow',
    theme: 'Nature & Animals · Noun',
    isCollected: true,
  },
  {
    id: 'cw-4',
    word: 'lantern',
    syllables: 'lan • tern',
    phonics: '/lan-turn/',
    sentence: 'The old willow tree held a glowing lantern that sang sweet tunes.',
    storyTitle: 'The Whispering Willow',
    theme: 'Light & Forest · Noun',
    isCollected: true,
  },
  {
    id: 'cw-5',
    word: 'submarine',
    syllables: 'sub • ma • rine',
    phonics: '/sub-muh-reen/',
    sentence: 'Captain Pip’s yellow submarine dove deep into the turquoise ocean.',
    storyTitle: "Captain Pip's Coral Reef",
    theme: 'Vehicles & Science · Noun',
    isCollected: true,
  },
  {
    id: 'cw-6',
    word: 'coral',
    syllables: 'cor • al',
    phonics: '/kor-ul/',
    sentence: 'Colourful coral gardens gave shelter to playful baby clownfish.',
    storyTitle: "Captain Pip's Coral Reef",
    theme: 'Ocean Life · Noun',
    isCollected: true,
  },
  {
    id: 'cw-7',
    word: 'clockwork',
    syllables: 'clock • work',
    phonics: '/klok-wurk/',
    sentence: 'The clockwork mechanism ticked like a soft heartbeat in the night.',
    storyTitle: "Luna's Clockwork Moon",
    theme: 'Invention & Science · Noun',
    isCollected: false,
  },
  {
    id: 'cw-8',
    word: 'airship',
    syllables: 'air • ship',
    phonics: '/air-ship/',
    sentence: 'The wooden airship sailed through wisps of silver cloud.',
    storyTitle: "Barnaby's Sky Deck",
    theme: 'Flight & Adventure · Noun',
    isCollected: false,
  },
  {
    id: 'cw-9',
    word: 'whistle',
    syllables: 'whis • tle',
    phonics: '/wis-ul/',
    sentence: 'The wind began to whistle a friendly bedtime lullaby.',
    storyTitle: 'The Whispering Willow',
    theme: 'Sound & Music · Verb',
    isCollected: false,
  },
];

// ==========================================
// 4. YOUTUBE CARTOON EPISODES & UNLOCK WORDS
// ==========================================
export const CARTOON_EPISODES: VideoEpisode[] = [
  {
    id: 'ep-1',
    title: 'Twinkle Star & Night Sky',
    channelName: 'Super Simple Songs',
    youtubeId: 'yCjJyiqpAuU',
    thumbnailEmoji: '⭐',
    duration: '3:05',
    isUnlocked: true,
    subtitleSnippet:
      'Twinkle, twinkle, little star, how I wonder what you are! Up above the world so high, like a diamond in the sky.',
    requiredWords: [
      { word: 'Star', emoji: '⭐', prompt: 'Find the Star' },
      { word: 'Sky', emoji: '🌌', prompt: 'Where is the Sky?' },
      { word: 'Diamond', emoji: '💎', prompt: 'Tap the Diamond' },
    ],
  },
  {
    id: 'ep-2',
    title: 'Pocoyo: Musical Blocks & Dance',
    channelName: 'Pocoyo Official',
    youtubeId: 'f77A7Qh3yO0',
    thumbnailEmoji: '🎵',
    duration: '7:15',
    isUnlocked: false,
    subtitleSnippet:
      'Hello Pocoyo! What do you have today? Look at those colourful blocks! One, two, three! Let us make some music and dance!',
    requiredWords: [
      { word: 'Duck', emoji: '🦆', prompt: 'Where is the Duck?' },
      { word: 'Music', emoji: '🎵', prompt: 'Find the Music notes' },
      { word: 'Dance', emoji: '💃', prompt: 'Who is Dancing?' },
    ],
  },
  {
    id: 'ep-3',
    title: 'The Friendly Caterpillar Journey',
    channelName: 'WildBrain Kids',
    youtubeId: 'Wb4X8N5H4Qo',
    thumbnailEmoji: '🐛',
    duration: '5:40',
    isUnlocked: false,
    subtitleSnippet:
      'Once upon a sunny morning, a little green caterpillar crawled under a big warm leaf. He nibbled on a red apple and a juicy pear.',
    requiredWords: [
      { word: 'Apple', emoji: '🍎', prompt: 'Find the yummy Apple' },
      { word: 'Sun', emoji: '☀️', prompt: 'Tap the bright Sun' },
      { word: 'Leaf', emoji: '🍃', prompt: 'Where is the Leaf?' },
    ],
  },
  {
    id: 'ep-4',
    title: 'Old MacDonald Had A Farm',
    channelName: 'PBS Kids / Toddler Tunes',
    youtubeId: '7X0Q4NX_2jw',
    thumbnailEmoji: '🐮',
    duration: '4:20',
    isUnlocked: false,
    subtitleSnippet:
      'Old MacDonald had a farm, E-I-E-I-O! And on that farm he had a cow, with a moo-moo here and a moo-moo there.',
    requiredWords: [
      { word: 'Cow', emoji: '🐮', prompt: 'Where is the Cow?' },
      { word: 'Pig', emoji: '🐷', prompt: 'Find the pink Pig' },
      { word: 'Tractor', emoji: '🚜', prompt: 'Find the green Tractor' },
    ],
  },
];

// ==========================================
// 5. LEARNING ACTIVITIES DATA
// ==========================================
export const NUMBERS_DATA: LearningItem[] = [
  { id: 'num-1', title: 'One', emoji: '1️⃣', count: 1, detailText: '1 Bright Sun ☀️', color: 'bg-bubble-yellow' },
  { id: 'num-2', title: 'Two', emoji: '2️⃣', count: 2, detailText: '2 Cute Puppies 🐶🐶', color: 'bg-bubble-peach' },
  { id: 'num-3', title: 'Three', emoji: '3️⃣', count: 3, detailText: '3 Sweet Apples 🍎🍎🍎', color: 'bg-bubble-pink' },
  { id: 'num-4', title: 'Four', emoji: '4️⃣', count: 4, detailText: '4 Green Frogs 🐸🐸🐸🐸', color: 'bg-bubble-mint' },
  { id: 'num-5', title: 'Five', emoji: '5️⃣', count: 5, detailText: '5 Golden Stars ⭐⭐⭐⭐⭐', color: 'bg-bubble-sky' },
  { id: 'num-6', title: 'Six', emoji: '6️⃣', count: 6, detailText: '6 Yummy Cookies 🍪🍪🍪🍪🍪🍪', color: 'bg-bubble-lavender' },
  { id: 'num-7', title: 'Seven', emoji: '7️⃣', count: 7, detailText: '7 Colourful Flowers 🌸🌸🌸🌸🌸🌸🌸', color: 'bg-bubble-pink' },
  { id: 'num-8', title: 'Eight', emoji: '8️⃣', count: 8, detailText: '8 Little Ducks 🦆🦆🦆🦆🦆🦆🦆🦆', color: 'bg-bubble-yellow' },
  { id: 'num-9', title: 'Nine', emoji: '9️⃣', count: 9, detailText: '9 Shiny Balloons 🎈🎈🎈🎈🎈🎈🎈🎈🎈', color: 'bg-bubble-mint' },
  { id: 'num-10', title: 'Ten', emoji: '🔟', count: 10, detailText: '10 Clapping Hands 👏 (High Five!)', color: 'bg-bubble-peach' },
];

export const ABC_LETTERS_DATA: LearningItem[] = [
  { id: 'abc-a', title: 'A is for Apple', emoji: '🍎', soundName: 'Ah ah Apple', color: 'bg-bubble-pink' },
  { id: 'abc-b', title: 'B is for Bunny', emoji: '🐰', soundName: 'Buh buh Bunny', color: 'bg-bubble-yellow' },
  { id: 'abc-c', title: 'C is for Cat', emoji: '🐱', soundName: 'Kuh kuh Cat', color: 'bg-bubble-peach' },
  { id: 'abc-d', title: 'D is for Dog', emoji: '🐶', soundName: 'Duh duh Dog', color: 'bg-bubble-mint' },
  { id: 'abc-e', title: 'E is for Elephant', emoji: '🐘', soundName: 'Eh eh Elephant', color: 'bg-bubble-sky' },
  { id: 'abc-f', title: 'F is for Fish', emoji: '🐠', soundName: 'Fff fish', color: 'bg-bubble-lavender' },
  { id: 'abc-g', title: 'G is for Guitar', emoji: '🎸', soundName: 'Guh guh Guitar', color: 'bg-bubble-yellow' },
  { id: 'abc-h', title: 'H is for Heart', emoji: '💖', soundName: 'Huh huh Heart', color: 'bg-bubble-pink' },
  { id: 'abc-s', title: 'S is for Sun', emoji: '☀️', soundName: 'Sss Sun', color: 'bg-bubble-yellow' },
  { id: 'abc-m', title: 'M is for Moon', emoji: '🌙', soundName: 'Mmm Moon', color: 'bg-bubble-sky' },
  { id: 'abc-z', title: 'Z is for Zebra', emoji: '🦓', soundName: 'Zzz Zebra', color: 'bg-bubble-mint' },
];

export const BODY_PARTS_DATA: LearningItem[] = [
  { id: 'body-eyes', title: 'Eyes', emoji: '👀', detailText: 'Two eyes to see the world!', soundName: 'Eyes', color: 'bg-bubble-sky' },
  { id: 'body-nose', title: 'Nose', emoji: '👃', detailText: 'One nose to smell sweet flowers!', soundName: 'Nose', color: 'bg-bubble-peach' },
  { id: 'body-mouth', title: 'Mouth', emoji: '👄', detailText: 'A mouth to smile and sing!', soundName: 'Mouth', color: 'bg-bubble-pink' },
  { id: 'body-ears', title: 'Ears', emoji: '👂', detailText: 'Two ears to hear fun music!', soundName: 'Ears', color: 'bg-bubble-yellow' },
  { id: 'body-hands', title: 'Hands', emoji: '👋', detailText: 'Two hands to clap and wave!', soundName: 'Hands', color: 'bg-bubble-mint' },
  { id: 'body-feet', title: 'Feet', emoji: '🦶', detailText: 'Two feet to dance and jump!', soundName: 'Feet', color: 'bg-bubble-lavender' },
  { id: 'body-heart', title: 'Heart', emoji: '❤️', detailText: 'A loving heart that beats thump-thump!', soundName: 'Heart', color: 'bg-bubble-pink' },
];

export const ANIMALS_DATA: LearningItem[] = [
  { id: 'anim-cow', title: 'Cow', emoji: '🐮', soundName: 'Moo! Moo!', color: 'bg-bubble-yellow' },
  { id: 'anim-lion', title: 'Lion', emoji: '🦁', soundName: 'Roar! The brave lion!', color: 'bg-bubble-peach' },
  { id: 'anim-duck', title: 'Duck', emoji: '🦆', soundName: 'Quack! Quack! Splish splash!', color: 'bg-bubble-mint' },
  { id: 'anim-frog', title: 'Frog', emoji: '🐸', soundName: 'Ribbit! Ribbit! Jump!', color: 'bg-bubble-mint' },
  { id: 'anim-sheep', title: 'Sheep', emoji: '🐑', soundName: 'Baa! Fluffy sheep!', color: 'bg-bubble-sky' },
  { id: 'anim-cat', title: 'Cat', emoji: '🐱', soundName: 'Meow! Purr purr!', color: 'bg-bubble-pink' },
  { id: 'anim-dog', title: 'Dog', emoji: '🐶', soundName: 'Woof! Woof! Good puppy!', color: 'bg-bubble-peach' },
];

export const COLOURS_SHAPES_DATA: LearningItem[] = [
  { id: 'shape-circle', title: 'Circle', emoji: '⭕', detailText: 'Round like a ball', soundName: 'Circle', color: 'bg-bubble-yellow' },
  { id: 'shape-square', title: 'Square', emoji: '🟩', detailText: 'Four equal sides', soundName: 'Square', color: 'bg-bubble-mint' },
  { id: 'shape-triangle', title: 'Triangle', emoji: '🔺', detailText: 'Three pointing corners', soundName: 'Triangle', color: 'bg-bubble-peach' },
  { id: 'shape-star', title: 'Star', emoji: '⭐', detailText: 'Five twinkling points', soundName: 'Star', color: 'bg-bubble-yellow' },
  { id: 'shape-heart', title: 'Heart', emoji: '💖', detailText: 'Full of love', soundName: 'Heart', color: 'bg-bubble-pink' },
  { id: 'color-red', title: 'Red', emoji: '🔴', soundName: 'Bright Red', color: 'bg-bubble-pink' },
  { id: 'color-blue', title: 'Blue', emoji: '🔵', soundName: 'Sky Blue', color: 'bg-bubble-sky' },
  { id: 'color-yellow', title: 'Yellow', emoji: '🟡', soundName: 'Sunshine Yellow', color: 'bg-bubble-yellow' },
  { id: 'color-green', title: 'Green', emoji: '🟢', soundName: 'Meadow Green', color: 'bg-bubble-mint' },
];

export const MUSIC_INSTRUMENTS_DATA: LearningItem[] = [
  { id: 'inst-xylophone', title: 'Xylophone', emoji: '🎼', soundName: 'Ding! Ting! Chiming xylophone!', color: 'bg-bubble-yellow' },
  { id: 'inst-drum', title: 'Drum', emoji: '🥁', soundName: 'Boom! Boom! Tap the drum!', color: 'bg-bubble-peach' },
  { id: 'inst-bell', title: 'Bell', emoji: '🔔', soundName: 'Ring-a-ling! Happy bell!', color: 'bg-bubble-sky' },
  { id: 'inst-piano', title: 'Piano', emoji: '🎹', soundName: 'Plink plonk! Beautiful piano!', color: 'bg-bubble-lavender' },
  { id: 'inst-trumpet', title: 'Trumpet', emoji: '🎺', soundName: 'Toot! Toot! Brass trumpet!', color: 'bg-bubble-mint' },
];

// ==========================================
// 6. PARENT DASHBOARD FLASHCARDS & WORKBOOKS
// ==========================================
export const PRACTICED_FLASHCARDS: FlashcardItem[] = [
  { id: 'fc-1', word: 'STAR', emoji: '⭐', category: 'Night Sky', phonics: '/s/ /t/ /ɑːr/' },
  { id: 'fc-2', word: 'DUCK', emoji: '🦆', category: 'Animals', phonics: '/d/ /ʌ/ /k/' },
  { id: 'fc-3', word: 'APPLE', emoji: '🍎', category: 'Fruits', phonics: '/ˈæp.əl/' },
  { id: 'fc-4', word: 'COW', emoji: '🐮', category: 'Farm', phonics: '/k/ /aʊ/' },
  { id: 'fc-5', word: 'EYES', emoji: '👀', category: 'My Body', phonics: '/aɪz/' },
  { id: 'fc-6', word: 'MOON', emoji: '🌙', category: 'Night Sky', phonics: '/m/ /uːn/' },
];

export const PRINTABLE_WORKBOOKS: WorkbookItem[] = [
  {
    id: 'wb-phonics',
    title: 'SpellToon 50-Word Phonics & Picture Workbook',
    price: '$4.99',
    emoji: '📘',
    pages: 36,
    description: 'High-contrast line art, letter tracing, cut-out matching cards, and bedtime rhymes tailored for ages 2–6.',
  },
  {
    id: 'wb-bedtime',
    title: 'Peaceful Bedtime Stories & Coloring Companion',
    price: '$6.99',
    emoji: '🌙',
    pages: 44,
    description: 'Gentle illustrated stories featuring Leo the Lion and friends with calming bedtime coloring pages.',
  },
  {
    id: 'wb-numbers',
    title: 'Count & Trace: Numbers 1 to 20 Adventure Pack',
    price: '$3.99',
    emoji: '🔢',
    pages: 28,
    description: 'Dot-to-dot puzzles, large finger tracing numbers, and animal counting sets.',
  },
];

export const VALID_UNLOCK_CODES = ['SPELLTOON', 'UNLOCKALL', 'KIDSFREE', 'SUPERSTAR'];
