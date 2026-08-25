import { Category, GoodDeed } from '@/types';

export const GOOD_DEEDS: GoodDeed[] = [
  // Colleagues
  { id: 'gd1', text: 'Скинул правки без единой лишней правки и согласовал макет за 5 минут', category: 'colleague' },
  { id: 'gd2', text: 'Принес в офис коробку свежих пончиков и никому не сказал, просто оставил на кухне', category: 'colleague' },
  { id: 'gd3', text: 'Прикрыл на созвоне перед генеральным, пока я дожевывал обед', category: 'colleague' },
  { id: 'gd4', text: 'Объяснил сложную задачу простыми словами без пассивной агрессии', category: 'colleague' },
  { id: 'gd5', text: 'Отменил пятничный созвон и написал: «Давайте отдохнем, коллеги»', category: 'boss' },
  { id: 'gd6', text: 'Выписал внезапную премию со словами: «Вы отлично поработали»', category: 'boss' },

  // Neighbors
  { id: 'gd7', text: 'Не сверлил стены в выходные и тихо ходил в мягких тапочках', category: 'neighbor' },
  { id: 'gd8', text: 'Придержал двери лифта, когда я бежал с тяжелыми сумками', category: 'neighbor' },
  { id: 'gd9', text: 'Забрал мою посылку у курьера и заботливо оставил у порога', category: 'neighbor' },

  // Couriers & Drivers
  { id: 'gd10', text: 'Привез заказ на 20 минут раньше, и пицца была еще горячей', category: 'courier' },
  { id: 'gd11', text: 'Пропустил в плотном потоке и мигнул аварийкой в ответ', category: 'driver' },
  { id: 'gd12', text: 'Включил приятную музыку и не стал заводить разговоры за жизнь', category: 'driver' },

  // Friends & Relatives
  { id: 'gd13', text: 'Позвонил просто спросить: «Как ты себя чувствуешь?» и выслушал без советов', category: 'friend' },
  { id: 'gd14', text: 'Позвал гулять именно тогда, когда я умирал от скуки и рутины', category: 'friend' },
  { id: 'gd15', text: 'Перевел долг ровно в обещанный день без напоминаний', category: 'friend' },
  { id: 'gd16', text: 'Не стал задавать на семейном ужине вопрос: «Ну когда уже женишься/дети?»', category: 'relative' },
  { id: 'gd17', text: 'Собрал банку домашнего варенья и свежих пирожков в дорогу', category: 'relative' },

  // Ex
  { id: 'gd18', text: 'Вовремя исчез из моей жизни и освободил место для настоящего счастья', category: 'ex' },
  { id: 'gd19', text: 'Вернул все мои любимые худи и книги в идеальном состоянии', category: 'ex' },

  // Other
  { id: 'gd20', text: 'Оставил очень щедрые чаевые и искренне улыбнулся', category: 'other' },
  { id: 'gd21', text: 'Подобрал и вернул упавшие ключи на улице', category: 'other' },
];

export function getRandomGoodDeed(category?: Category): string {
  let pool = GOOD_DEEDS;
  if (category) {
    const matched = GOOD_DEEDS.filter((d) => d.category === category);
    if (matched.length > 0) pool = matched;
  }
  return pool[Math.floor(Math.random() * pool.length)].text;
}
