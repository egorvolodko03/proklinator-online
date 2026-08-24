import { Sin, Category } from '@/types';

export const SINS: Sin[] = [
  // Colleague
  { id: 's-c1', text: 'Игнорит в почте 2 недели и потом пишет "актуально?"', category: 'colleague' },
  { id: 's-c2', text: 'Записывает 7-минутные голосовые без темы и пауз', category: 'colleague' },
  { id: 's-c3', text: 'Ставит созвон на 18:30 в пятницу со словами "на 5 минут"', category: 'colleague' },
  { id: 's-c4', text: 'Греет минтай с луком в общей офисной микроволновке', category: 'colleague' },
  { id: 's-c5', text: 'Пишет "Привет" и молчит 15 минут, пока не ответишь', category: 'colleague' },

  // Boss
  { id: 's-b1', text: 'Обещал годовой бонус, но выдал фирменный блокнот и ручку', category: 'boss' },
  { id: 's-b2', text: 'Придумал срочную задачу в субботу утром и ушел играть в гольф', category: 'boss' },
  { id: 's-b3', text: 'Отклонил отпуск, потому что "сейчас критический этап для компании"', category: 'boss' },

  // Neighbor
  { id: 's-n1', text: 'Сверлит несущую стену в воскресенье ровно в 8:00 утра', category: 'neighbor' },
  { id: 's-n2', text: 'Двигает чугунную мебель по ночам под звуки баяна', category: 'neighbor' },
  { id: 's-n3', text: 'Оставляет мешок с мусором на общем лестничном пролете на 3 дня', category: 'neighbor' },

  // Ex
  { id: 's-e1', text: 'Смотрит все сторис через анонимный аккаунт и не признается', category: 'ex' },
  { id: 's-e2', text: 'Не вернул(а) любимый худи и любимую книгу Стивена Кинга', category: 'ex' },
  { id: 's-e3', text: 'Внезапно написал(а) "Привет, как ты?" спустя 4 года тишины', category: 'ex' },

  // Driver
  { id: 's-d1', text: 'Занял сразу два парковочных места по диагонали', category: 'driver' },
  { id: 's-d2', text: 'Не включает поворотники при перестроении на скорости 120', category: 'driver' },
  { id: 's-d3', text: 'Окатил из глубокой лужи и даже не притормозил', category: 'driver' },

  // Courier / Service
  { id: 's-cr1', text: 'Привез пиццу перевернутой вверх тормашками', category: 'courier' },
  { id: 's-cr2', text: 'Позвонил в домофон и сразу убежал на 9 этаж пешком', category: 'courier' },

  // Friend / Relative
  { id: 's-f1', text: 'Взял в долг 1000 рублей и удалил Telegram', category: 'friend' },
  { id: 's-r1', text: 'Спросил на семейном ужине: "А когда уже свадьба и дети?"', category: 'relative' },
  { id: 's-f2', text: 'Заспойлерил финал сериала в групповом чате на 20 человек', category: 'friend' },
];

export function getRandomSin(category?: Category): string {
  const filtered = category ? SINS.filter((s) => s.category === category) : SINS;
  const list = filtered.length > 0 ? filtered : SINS;
  return list[Math.floor(Math.random() * list.length)].text;
}
