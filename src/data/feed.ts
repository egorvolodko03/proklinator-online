import { KarmaFeedItem } from '@/types';

export const INITIAL_FEED: KarmaFeedItem[] = [
  {
    id: 'f1',
    targetName: 'Марина из бухгалтерии',
    category: 'colleague',
    sin: 'Забыла перечислить командировочные вовремя',
    curseTitle: 'Фатальный #ССЫЛКА!',
    severity: 'medium',
    timeAgo: '1 мин назад',
  },
  {
    id: 'f2',
    targetName: 'Артем с 4 этажа',
    category: 'neighbor',
    sin: 'Сверлит в воскресенье в 8:00 утра',
    curseTitle: 'Соседский перфоратор возмездия',
    severity: 'extreme',
    timeAgo: '3 мин назад',
  },
  {
    id: 'f3',
    targetName: 'Бывший Денис',
    category: 'ex',
    sin: 'Забыл вернуть наушники и толстовку',
    curseTitle: 'Случайный лайк фото 2017 года',
    severity: 'extreme',
    timeAgo: '7 мин назад',
  },
  {
    id: 'f4',
    targetName: 'Тимлид Владислав',
    category: 'boss',
    sin: 'Поставил синк на 19:00 пятницы',
    curseTitle: 'Камера в момент жевания',
    severity: 'medium',
    timeAgo: '12 мин назад',
  },
  {
    id: 'f5',
    targetName: 'Водитель белого соляриса',
    category: 'driver',
    sin: 'Занял 2 места у подъезда',
    curseTitle: 'Парковка в миллиметре',
    severity: 'extreme',
    timeAgo: '18 мин назад',
  },
  {
    id: 'f6',
    targetName: 'Коллега из чата',
    category: 'colleague',
    sin: 'Пишет "Доброго времени суток"',
    curseTitle: 'Стыдный Т9',
    severity: 'light',
    timeAgo: '24 мин назад',
  }
];
