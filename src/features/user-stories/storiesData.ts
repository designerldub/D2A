// ── Types ────────────────────────────────────────────

export const STORY_TYPES = ['text', 'audio', 'brochure', 'journey', 'infographic', 'quotes', 'wordcloud'] as const
export type StoryType = typeof STORY_TYPES[number]

export const TYPE_LABELS: Record<StoryType, string> = {
  text:        'Text',
  audio:       'Audio',
  brochure:    'AI Brochure',
  journey:     'Visual Journey',
  infographic: 'Infographic',
  quotes:      'Quotes',
  wordcloud:   'Word Cloud',
}

export const TYPE_COLORS: Record<StoryType, { bg: string; color: string }> = {
  text:        { bg: '#f3f4f6', color: '#374151' },
  audio:       { bg: '#ede9fe', color: '#6d28d9' },
  brochure:    { bg: '#dbeafe', color: '#1d4ed8' },
  journey:     { bg: '#cffafe', color: '#0e7490' },
  infographic: { bg: '#fef3c7', color: '#b45309' },
  quotes:      { bg: '#fce7f3', color: '#9d174d' },
  wordcloud:   { bg: '#d1fae5', color: '#065f46' },
}

export const STORY_CATEGORIES = [
  'Recovery',
  'Recovery progress report',
  'Service access',
  'Service experience',
  'Interaction with first responders',
  'Experiences with housing instability',
  'Experiences with employment',
  'Other',
] as const

export type StoryCategory = typeof STORY_CATEGORIES[number]

export type JourneyStep = {
  period: string
  title: string
  description: string
  mood?: 'positive' | 'neutral' | 'negative'
}

export type BrochureSection = {
  label: string
  content: string
}

export type WordEntry = {
  word: string
  weight: number  // 1–5
}

export type Story = {
  id: number
  title: string
  type: StoryType
  org: string
  tags: StoryCategory[]
  snippet: string
  // Text
  paragraphs?: string[]
  pullQuote?: string
  // Audio
  duration?: string
  transcript?: string
  waveform?: number[]  // bar heights 1–10
  // Visual Journey
  steps?: JourneyStep[]
  // Infographic
  themes?: string[]
  barriers?: string[]
  strengths?: string[]
  takeaway?: string
  // Quotes
  quotes?: string[]
  // Word Cloud
  words?: WordEntry[]
  // Infographic stats
  infographicStats?: { label: string; value: string; color: string }[]
  // AI Brochure
  brochureHero?: string
  brochureSections?: BrochureSection[]
}

// ── Mock data ─────────────────────────────────────────

export const STORIES: Story[] = [
  {
    id: 1,
    title: 'Finding My Way Back',
    type: 'text',
    org: 'Organization A',
    tags: ['Recovery', 'Service experience'],
    snippet: 'After years of struggling, connecting with my care team changed everything. This is the story of how I found stability, one step at a time.',
    pullQuote: 'The first time someone asked me how I was actually doing — and waited for the real answer — I didn\'t know what to say. But I knew something had shifted.',
    paragraphs: [
      'Three years ago, I was sleeping in my car. Not because I had nowhere to go, but because the places I could go felt more dangerous than the street. I had been in and out of programs, in and out of relationships, in and out of moments where I thought things might actually turn around.',
      'The first time I walked through the doors of the resource center, I almost left. The waiting room was full, the fluorescent lights were too bright, and I had told myself a hundred times before that asking for help didn\'t work for people like me. But I stayed. And the person who came to sit with me didn\'t have a clipboard. They just asked how I was doing.',
      'Recovery isn\'t linear. I want to be honest about that. There were weeks I didn\'t show up. There were setbacks that felt like starting over. There were mornings I wasn\'t sure the effort was worth it. What kept me coming back was a team that treated those setbacks as part of the process, not as failures.',
      'Today I have a place of my own. I work part-time. I\'m rebuilding relationships I thought were gone forever. None of that happened because of one decision or one program. It happened because a system of people refused to give up on me — even when I had given up on myself.',
      'I don\'t share this story to inspire anyone. I share it because I spent years thinking I was alone in what I was going through. I wasn\'t. And if you\'re reading this, neither are you.',
    ],
  },
  {
    id: 2,
    title: 'A Year of Progress',
    type: 'audio',
    org: 'Organization C',
    tags: ['Recovery progress report'],
    snippet: 'A 3-minute audio story about navigating behavioral health resources and the moments of support that made the difference.',
    duration: '3:12',
    waveform: [3, 5, 4, 7, 6, 8, 5, 4, 9, 7, 6, 8, 5, 3, 6, 8, 7, 9, 6, 5, 4, 7, 8, 6, 5, 4, 7, 6, 8, 9, 7, 5, 6, 4, 7, 8, 5, 6, 9, 7],
    transcript: 'I remember the first time someone asked me how I was actually doing — and waited for the real answer. Not the \'fine, thanks\' answer. The real one.\n\nI\'d been seeing my case worker for about six weeks at that point. We\'d been going through the motions — appointments, paperwork, check-ins. And then one afternoon she just stopped mid-sentence and said, "How are you really doing?"\n\nI think I cried for about ten minutes. And nothing was solved that day. But something cracked open that needed to crack open.\n\nOver the next year, we worked on a lot. Housing. Medication. Rebuilding relationships with my family. Some things went better than expected. Some things didn\'t go the way we planned. But I never felt like I was doing it alone.\n\nIf I could say one thing to someone who\'s just starting out — it would be this: let people in. Not all the way, not all at once. But let them in a little. That\'s where it starts.',
  },
  {
    id: 3,
    title: 'Housing First Changed Everything',
    type: 'journey',
    org: 'Organization B',
    tags: ['Experiences with housing instability', 'Recovery'],
    snippet: 'A step-by-step visual of the path from a shelter waitlist to a stable home — and what the community made possible along the way.',
    steps: [
      { period: 'January',   title: 'Crisis Point',       description: 'Lost housing after a medical emergency drained all savings. Moved between a shelter and a friend\'s couch while navigating a 90-day waitlist.', mood: 'negative' },
      { period: 'February',  title: 'First Contact',      description: 'Connected with an outreach worker who helped me understand what services were available. Applied for three housing programs in the same week.', mood: 'neutral' },
      { period: 'March',     title: 'Temporary Stability',description: 'Placed in transitional housing. Had my own room for the first time in months. Began attending weekly group sessions for peer support.', mood: 'positive' },
      { period: 'May',       title: 'Setback',            description: 'Lost my transitional placement due to a program rule I didn\'t fully understand. Had to start parts of the process over. Felt like failure.', mood: 'negative' },
      { period: 'June',      title: 'Turning Point',      description: 'An advocate at the resource center helped me appeal and navigate a new housing application. Learned I had more options than I realized.', mood: 'neutral' },
      { period: 'September', title: 'Permanent Housing',  description: 'Received keys to my own apartment. First night alone in a space that was mine. Called my sister for the first time in two years.', mood: 'positive' },
      { period: 'Today',     title: 'Building Forward',   description: 'Living stably for eight months. Working part-time. Reconnected with family. Still attending check-ins — now as a volunteer greeter at the drop-in center.', mood: 'positive' },
    ],
  },
  {
    id: 4,
    title: 'Voices from the Community',
    type: 'quotes',
    org: 'Organization D',
    tags: ['Service access', 'Service experience'],
    snippet: 'A collection of short, powerful moments shared by community members about what access to care really feels like.',
    quotes: [
      'The moment they listened without judging, everything changed. I\'d been telling my story for years to people who were already writing the next question. This was different.',
      'I didn\'t know I could ask for help with transportation. When they offered a ride to my first appointment, I almost said no out of habit. I\'m glad I didn\'t.',
      'What surprised me most was that no one made me feel like I had to be a certain kind of broken to deserve support.',
      'My case worker remembered details I had mentioned in passing — months later. That kind of attention changed how I felt about the whole thing.',
      'I\'ve told my story to a lot of people. This was the first time I felt like the story actually went somewhere.',
      'Recovery isn\'t something that happens to you. It\'s something you build, slowly, with people who believe you can.',
    ],
  },
  {
    id: 5,
    title: 'My Journey in Numbers',
    type: 'infographic',
    org: 'Organization A',
    tags: ['Recovery progress report', 'Experiences with employment'],
    snippet: 'Key themes, barriers overcome, and strengths that defined a year of recovery — visualized through data and design.',
    themes: ['Stability', 'Connection', 'Resilience', 'Progress', 'Community', 'Hope'],
    barriers: ['Transportation gaps', 'Long waitlists', 'Stigma from family', 'Loss of income', 'Documentation requirements'],
    strengths: ['Consistent case management', 'Peer support group', 'Clear goal-setting', 'Family reconnection', 'Employment coaching'],
    takeaway: 'Over 14 months, with consistent support and two significant setbacks, this individual went from crisis to stable employment and housing — demonstrating that sustained, flexible support is the most important factor in long-term recovery outcomes.',
    infographicStats: [
      { label: 'Months in program',     value: '14', color: '#1d4ed8' },
      { label: 'Appointments attended', value: '47', color: '#0e7490' },
      { label: 'Setbacks navigated',    value: '2',  color: '#dc2626' },
      { label: 'Goals reached',         value: '5',  color: '#16a34a' },
    ],
  },
  {
    id: 6,
    title: 'The Words That Describe My Year',
    type: 'wordcloud',
    org: 'Organization C',
    tags: ['Recovery', 'Other'],
    snippet: 'The language of recovery, shaped by one person\'s experience. The most meaningful words, sized by what mattered most.',
    words: [
      { word: 'Hope', weight: 5 },
      { word: 'Community', weight: 5 },
      { word: 'Patience', weight: 4 },
      { word: 'Stability', weight: 5 },
      { word: 'Trust', weight: 4 },
      { word: 'Progress', weight: 4 },
      { word: 'Connection', weight: 3 },
      { word: 'Resilience', weight: 4 },
      { word: 'Courage', weight: 3 },
      { word: 'Setbacks', weight: 3 },
      { word: 'Growth', weight: 3 },
      { word: 'Support', weight: 5 },
      { word: 'Family', weight: 4 },
      { word: 'Honesty', weight: 2 },
      { word: 'Recovery', weight: 5 },
      { word: 'Belonging', weight: 3 },
      { word: 'Change', weight: 2 },
      { word: 'Rest', weight: 2 },
      { word: 'Gratitude', weight: 3 },
      { word: 'Tomorrow', weight: 2 },
    ],
  },
  {
    id: 7,
    title: 'A New Chapter',
    type: 'brochure',
    org: 'Organization E',
    tags: ['Recovery', 'Service experience'],
    snippet: 'An AI-generated brochure capturing a personal story of renewal — from first contact with services to community reintegration.',
    brochureHero: 'One Person\'s Story of Recovery',
    brochureSections: [
      {
        label: 'Where It Started',
        content: 'After a difficult period of personal loss and isolation, connecting with community services felt like admitting defeat. But one low-barrier drop-in center offered something different — no appointments, no requirements, just presence.',
      },
      {
        label: 'The Turning Point',
        content: 'Six weeks in, a peer support specialist who had been through a similar journey offered to walk alongside through the next steps. Having someone who understood — not just professionally, but personally — made the difference.',
      },
      {
        label: 'Building a Life',
        content: 'Over the following year, progress came in small, meaningful steps: stable housing, reconnected relationships, part-time work. Each milestone built on the last, supported by a consistent team that adapted to changing needs.',
      },
      {
        label: 'Looking Forward',
        content: 'Today, this individual volunteers at the same drop-in center where their journey began — offering the same presence that was once offered to them. The chapter isn\'t finished. But it\'s a good one.',
      },
    ],
  },
  {
    id: 8,
    title: 'When Help Arrived',
    type: 'text',
    org: 'Organization B',
    tags: ['Interaction with first responders', 'Service access'],
    snippet: 'The night everything shifted — and how a trained first responder became the bridge to a system of care that was waiting.',
    pullQuote: 'He didn\'t arrive with handcuffs. He arrived with a question: "What do you need right now?" That changed everything about what happened next.',
    paragraphs: [
      'The call came in at 2am. That\'s all I knew when I found out later. A neighbor had called — not maliciously, just worried. They didn\'t know what to do with what they were seeing through the window.',
      'The person who showed up was a co-responder — a mental health clinician paired with a police officer. I didn\'t know that was a thing. I had braced for something very different.',
      'He didn\'t arrive with handcuffs. He arrived with a question: "What do you need right now?" That changed everything about what happened next.',
      'What followed wasn\'t simple. There were forms, evaluations, difficult conversations about what kind of support I needed and whether I was willing to accept it. But at every step, I was asked — not told. That distinction mattered more than I can explain.',
      'The co-responder followed up the next day. And the day after. He connected me to a case worker who helped me figure out next steps. Six months later, I\'m still in contact with that case worker. We\'re working on things together that I never thought I\'d be working on.',
      'I used to think the system wasn\'t built for people like me. Maybe that\'s still sometimes true. But that night, the system sent the right person.',
    ],
  },
  {
    id: 9,
    title: 'Back to Work',
    type: 'journey',
    org: 'Organization D',
    tags: ['Experiences with employment', 'Recovery progress report'],
    snippet: 'Eighteen months, four jobs applied for, and one that stuck. A visual journey through the barriers and breakthroughs of re-entering the workforce.',
    steps: [
      { period: 'Month 1',  title: 'Starting the Conversation',  description: 'First meeting with an employment coach. Hadn\'t worked in two years. The conversation started with strengths, not gaps — that framing helped.', mood: 'neutral' },
      { period: 'Month 3',  title: 'First Application',          description: 'Applied for a warehouse position. Didn\'t get it. The feedback was about gaps in work history — something we hadn\'t figured out how to address yet.', mood: 'negative' },
      { period: 'Month 5',  title: 'Skills Training',            description: 'Enrolled in a 6-week certification program through the resource center. Forklift certification + basic logistics. Learned alongside three others in similar situations.', mood: 'neutral' },
      { period: 'Month 8',  title: 'Second and Third Attempts',  description: 'Applied twice more. One callback, one interview, no offer. Disappointed but not done. Coach helped reframe each attempt as practice, not failure.', mood: 'negative' },
      { period: 'Month 12', title: 'The Offer',                  description: 'Part-time position at a local distribution center. Twenty hours a week to start. Accepted. First paycheck felt surreal.', mood: 'positive' },
      { period: 'Month 15', title: 'Full-Time',                  description: 'Moved to full-time. Benefits kicked in. Able to cover rent for the first time in years without assistance.', mood: 'positive' },
      { period: 'Month 18', title: 'Stable and Planning',        description: 'Still employed. Starting to save. Beginning to think about next steps — not just surviving, but building something.', mood: 'positive' },
    ],
  },
  {
    id: 10,
    title: 'What Recovery Sounds Like',
    type: 'audio',
    org: 'Organization E',
    tags: ['Recovery', 'Service experience'],
    snippet: 'Listen in as one person reflects on what recovery actually feels like — the setbacks, the small wins, and the people who helped.',
    duration: '4:47',
    waveform: [4, 6, 5, 3, 7, 8, 6, 5, 4, 7, 9, 6, 5, 8, 7, 4, 5, 6, 8, 9, 7, 5, 4, 6, 7, 8, 5, 4, 3, 6, 7, 9, 8, 6, 5, 7, 4, 6, 8, 5],
    transcript: 'People ask what recovery feels like. I usually say it feels like waking up slowly. Not all at once. Not in a moment. Slowly, over a long time, in a direction you didn\'t always believe in.\n\nI had a lot of small wins this year. Getting a library card. That sounds ridiculous, but it mattered. Making it to three appointments in a row without canceling. Calling my mom back the same day she called. These aren\'t big things. But they\'re the texture of what recovery actually is.\n\nThe setbacks were real too. I don\'t want to gloss over that. There was a month where I lost a lot of ground. I don\'t fully understand why, even now. But the people around me didn\'t treat it like a failure. They treated it like weather. It\'s hard to describe how much that helped.\n\nWhat I want people to know is that recovery isn\'t a destination. It\'s more like a way of traveling. Some days you cover a lot of ground. Some days you stay still. Some days you go backwards. But if you keep moving in mostly the right direction, over time, you end up somewhere you couldn\'t have imagined.',
  },
  {
    id: 11,
    title: 'Turning Points',
    type: 'infographic',
    org: 'Organization B',
    tags: ['Interaction with first responders', 'Recovery'],
    snippet: 'From crisis to stability — the key turning points mapped out, with the barriers, strengths, and takeaways that shaped the journey.',
    themes: ['Safety', 'Trust', 'Advocacy', 'Healing', 'Rebuilding'],
    barriers: ['Fear of systems', 'Past negative experiences', 'Lack of transportation', 'Mental health crisis'],
    strengths: ['Co-responder program', 'Trauma-informed care', 'Consistent advocate', 'Voluntary engagement'],
    takeaway: 'A co-responder approach — pairing mental health clinicians with law enforcement — changed the trajectory of this person\'s relationship with services. Voluntary, trauma-informed engagement from the first contact was the critical factor.',
    infographicStats: [
      { label: 'Days to first contact',  value: '1', color: '#0e7490' },
      { label: 'Follow-up visits',       value: '8', color: '#1d4ed8' },
      { label: 'Services connected',     value: '4', color: '#16a34a' },
      { label: 'Months to stability',    value: '6', color: '#b45309' },
    ],
  },
  {
    id: 12,
    title: 'Community in One Word',
    type: 'wordcloud',
    org: 'Organization A',
    tags: ['Service experience', 'Recovery progress report'],
    snippet: 'When asked to describe their community support in one word, dozens of people answered. Here\'s what they said.',
    words: [
      { word: 'Seen', weight: 5 },
      { word: 'Heard', weight: 5 },
      { word: 'Safe', weight: 5 },
      { word: 'Warm', weight: 4 },
      { word: 'Steady', weight: 4 },
      { word: 'Real', weight: 3 },
      { word: 'Human', weight: 4 },
      { word: 'Possible', weight: 3 },
      { word: 'Present', weight: 4 },
      { word: 'Enough', weight: 3 },
      { word: 'Kind', weight: 3 },
      { word: 'Open', weight: 2 },
      { word: 'Consistent', weight: 3 },
      { word: 'Unjudged', weight: 4 },
      { word: 'Believed', weight: 5 },
      { word: 'Welcome', weight: 3 },
      { word: 'Together', weight: 2 },
      { word: 'Forward', weight: 2 },
    ],
  },
]

export const ORGS = [...new Set(STORIES.map((s) => s.org))].sort()
