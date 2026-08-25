import { Blessing, BlessingLevel, Category } from '@/types';

export const BLESSINGS: Blessing[] = [
  // --- LEVEL 1: SMALL COMFORT (Малая Благодать) ---
  {
    id: 'b1',
    title: 'Идеальное Авокадо',
    description: 'Пусть каждый авокадо, который ты покупаешь, будет идеально спелым, без коричневых волокон и с крошечной косточкой.',
    level: 'small',
    category: 'all',
    icon: '🥑',
  },
  {
    id: 'b2',
    title: 'Зеленая Волна',
    description: 'Пусть на всех перекрестках твоего пути светофоры переключаются на зеленый ровно за 2 секунды до твоего приближения.',
    level: 'small',
    category: 'driver',
    icon: '🚦',
  },
  {
    id: 'b3',
    title: 'Всегда с Первого Раза',
    description: 'Пусть любой USB-провод, ключ от замка и разъем Type-C входят ровно с первого раза даже в полной темноте.',
    level: 'small',
    category: 'all',
    icon: '⚡',
  },
  {
    id: 'b4',
    title: 'Горячая Пицца без Задержек',
    description: 'Пусть любая доставка еды приезжает за 15 минут, а сыр на пицце тянется как в рекламе из 90-х.',
    level: 'small',
    category: 'courier',
    icon: '🍕',
  },
  {
    id: 'b5',
    title: 'Свежая Подушка с Обеих Сторон',
    description: 'Пусть подушка всегда будет прохладной с обеих сторон, а одеяло никогда не вылезает из пододеяльника.',
    level: 'small',
    category: 'all',
    icon: '🛏️',
  },
  {
    id: 'b6',
    title: 'Идеальный Чек',
    description: 'Пусть в супермаркете кассир откроет соседнюю пустую кассу именно перед тобой со словами: «Проходите сюда».',
    level: 'small',
    category: 'other',
    icon: '🛒',
  },
  {
    id: 'b7',
    title: 'Вечный Заряд Наушников',
    description: 'Пусть кейс беспроводных наушников никогда не разряжается в дороге, даже если ты забыл зарядить его на ночь.',
    level: 'small',
    category: 'all',
    icon: '🎧',
  },

  // --- LEVEL 2: ZEN & WORKPLACE NIRVANA (Офисный Дзен) ---
  {
    id: 'b8',
    title: 'Правки: Принято без Замечаний',
    description: 'Пусть любой заказчик и начальник пишет тебе только: «Шедевр, принято, оплата уже ушла вам на карту».',
    level: 'zen',
    category: 'colleague',
    icon: '💎',
  },
  {
    id: 'b9',
    title: 'Созвон Отменен',
    description: 'Пусть пятничный созвон в 18:00 всегда отменяется организатором со словами: «Давайте всё решим текстом в чате».',
    level: 'zen',
    category: 'colleague',
    icon: '☕',
  },
  {
    id: 'b10',
    title: 'Неуязвимый Wi-Fi',
    description: 'Пусть твой интернет летает со скоростью 1 Гбит/с даже в глухом лифте и подвале заброшенного бункера.',
    level: 'zen',
    category: 'all',
    icon: '📡',
  },
  {
    id: 'b11',
    title: 'Кофе за Счет Вселенной',
    description: 'Пусть кофемашина всегда наливает тебе двойную порцию без очереди, а бариста рисует котика на пенке.',
    level: 'zen',
    category: 'colleague',
    icon: '☕',
  },
  {
    id: 'b12',
    title: 'Иммунитет к Глупым Вопросам',
    description: 'Пусть в рабочих чатах на любые твои сообщения все сразу понимают суть без пяти переспросов.',
    level: 'zen',
    category: 'colleague',
    icon: '🧘',
  },
  {
    id: 'b13',
    title: 'Случайная Забытая Купюра',
    description: 'Пусть во внутреннем кармане каждой твоей куртки всегда случайно лежит забытая пятитысячная купюра.',
    level: 'zen',
    category: 'all',
    icon: '💵',
  },

  // --- LEVEL 3: SUPREME ASTRAL FORTUNE (Абсолютное Везение) ---
  {
    id: 'b14',
    title: 'Кармический Джекпот',
    description: 'Пусть любое твое спонтанное решение оборачивается феноменальным успехом, а все бывшие кусают локти от зависти.',
    level: 'supreme',
    category: 'ex',
    icon: '👑',
  },
  {
    id: 'b15',
    title: 'Свободное Место у Окна',
    description: 'Пусть при любой регистрации на рейс тебя бесплатно пересаживают в бизнес-класс с безлимитным шампанским.',
    level: 'supreme',
    category: 'all',
    icon: '✈️',
  },
  {
    id: 'b16',
    title: 'Священный Метаболизм',
    description: 'Пусть все калории от ночной пиццы, тортов и бургеров трансформируются исключительно в чистую энергию и кубики пресса.',
    level: 'supreme',
    category: 'all',
    icon: '🍰',
  },
  {
    id: 'b17',
    title: 'Аура Вечного Спокойствия',
    description: 'Пусть никакие пробки, дедлайны и токсичные люди не могут поколебать твой внутренний абсолютный покой.',
    level: 'supreme',
    category: 'all',
    icon: '🕊️',
  },
];

export function getRandomBlessing(level: BlessingLevel = 'zen', category?: Category): Blessing {
  let pool = BLESSINGS.filter((b) => b.level === level);
  if (category) {
    const categoryMatches = pool.filter((b) => b.category === category || b.category === 'all');
    if (categoryMatches.length > 0) pool = categoryMatches;
  }
  if (pool.length === 0) pool = BLESSINGS;
  return pool[Math.floor(Math.random() * pool.length)];
}
