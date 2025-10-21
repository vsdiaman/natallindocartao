export type Template = {
  id: number;
  title: string;
  image: string;
  tag: string;
};

const TAGS = [
  'christmas',
  'santa',
  'reindeer',
  'christmas tree',
  'gifts',
  'ornaments',
  'snow',
  'wreath',
  'bells',
  'candy cane',
  'star',
  'mistletoe',
  'gingerbread',
  'snowman',
  'nativity',
];

// 50 itens temáticos com lock estável
export const TEMPLATES: Template[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const tag = TAGS[i % TAGS.length];
  const q = encodeURIComponent(`christmas,${tag},red,white`);
  return {
    id,
    tag,
    title: `Christmas ${id}`,
    image: `https://loremflickr.com/600/800/${q}?lock=${id}`,
  };
});
