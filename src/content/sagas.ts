import type { Look } from '../avatars';
import type { Scene } from '../Scene';
import { Cast, compilePages, Page, PageSrc, parseScene, person, skins } from './dsl';

// A "big story": the same chapters told by different characters. Readers can switch
// point of view at any chapter, like picking a character in a game.

export type Pov = { id: string; name: string; look: Look; color: string; tagline: string };

export type Saga = {
  id: string;
  title: string;
  blurb: string;
  scene: Scene;
  povs: Pov[];
  // chapters[c].tellings[povId] = pages for that chapter from that character's view
  chapters: { title: string; tellings: Record<string, Page[]> }[];
};

type SagaSrc = Omit<Saga, 'scene' | 'chapters'> & {
  cast: Cast;
  scene: string;
  chapters: { title: string; tellings: Record<string, PageSrc[]> }[];
};

const moonCast: Cast = {
  mia: { name: 'Mia', about: 'A girl who can’t sleep.', look: person('long', '#3B2A20', '#FF8FB8', skins.tan) },
  ember: { name: 'Ember', about: 'A young dragon learning to fly.', look: { kind: 'dragon' } },
  luna: { name: 'The Moon', about: 'Who just wanted a closer look.', look: { kind: 'moon' } },
};

const src: SagaSrc[] = [
  {
    id: 'moon-stuck',
    title: 'The Night the Moon Got Stuck',
    blurb: 'One night, three heroes, three sides of the same story.',
    cast: moonCast,
    scene: 'night | luna@.5 d.85 s1 float, tree@.5 d.5 s1.6 none, mia@.2 bob, ember@.8 d.1 bob flip | stars',
    povs: [
      { id: 'mia', name: 'Mia', look: moonCast.mia.look, color: '#FFB5D0', tagline: 'A girl who can’t sleep' },
      { id: 'ember', name: 'Ember', look: moonCast.ember.look, color: '#B8E8C4', tagline: 'A young dragon learning to fly' },
      { id: 'luna', name: 'The Moon', look: moonCast.luna.look, color: '#FFE08A', tagline: 'Who just wanted a closer look' },
    ],
    chapters: [
      {
        title: 'A Strange Night',
        tellings: {
          mia: [
            ['Mia couldn’t sleep. She had counted sheep, cows, and even ducks. But her room was much too dark. Usually, moonlight came through her window and made silver shapes on the floor. Tonight, there was nothing. “Where is the moon?” she whispered.', 'night | bed@.5 d.2 s1.1 none, mia@.45 d.15 s.6 bob | stars'],
            ['Mia climbed out of bed and tiptoed to the window. She pressed her nose to the cold glass. Down in the garden, the old oak tree was glowing. Its branches were wiggling. And caught in the very top, like a balloon on a string, was the moon!', 'night | tree@.55 d.5 s1.7 none, luna@.55 d.55 s.8 walk, mia@.15 d.2 s.7 | stars', 'predict: How do you think the moon got stuck in a tree?'],
            ['Mia rubbed her eyes. She pinched her arm. Ouch. She was definitely awake. The moon was stuck in the oak tree, and it looked like it was trying to wiggle free. “Someone has to help,” Mia said to herself. “And it looks like everyone else is asleep.”', 'night | mia@.35, tree@.65 d.5 s1.6 none, luna@.65 d.55 s.7 walk | stars', 'think: Why does Mia decide she has to help? | She is bored | *Everyone else is asleep and the moon needs help | She wants to keep the moon >> Sometimes helping starts with noticing.'],
          ],
          ember: [
            ['Ember was a young dragon, and tonight she was practising night flying for the very first time. Flap, flap, wobble. Flap, flap, WOBBLE. Flying in the dark was much harder than flying in the sun. Everything looked different without the light.', 'night | ember@.15->.7 d.4 s.8 float | motion stars'],
            ['“Why is it so dark?” Ember grumbled. Usually, the moon lit up the sky like a lantern for night flyers. She looked up. No moon. She looked left. No moon. She looked down, and nearly fell out of the sky. There it was, caught in a tree like a kite!', 'night | tree@.6 d.5 s1.7 none, luna@.6 d.55 s.8 walk, ember@.2 d.3 s.8 float | stars', 'find:luna Can you find the moon stuck in the tree?'],
            ['“Uh oh,” said Ember. Her mother had always said that if the moon ever came down, the tides would get confused and the night flowers wouldn’t bloom. “This is a big problem,” Ember said. “And I’m a dragon. Dragons fix big problems. I think.”', 'night | ember@.4 d.3 s.9, tree@.75 d.5 s1.4 none, luna@.75 d.55 s.6 | stars', 'think: Does Ember feel sure she can help? | Yes, totally sure | *Not totally, but she wants to try | She doesn’t care >> We can try even when we aren’t sure.'],
          ],
          luna: [
            ['Every night for a million years, the Moon had watched the world from far away. She saw the oceans, the mountains, the cities with their twinkling lights. But she always wondered: what did it all look like up close?', 'space | luna@.5 d.5 s1.4 float, planet#5AB0F0@.85 d.9 s.6 float | stars'],
            ['Tonight, she decided to find out. Just a quick peek. She floated down, down, down, past the clouds and the birds and the rooftops. Everything was so much bigger than she’d imagined! The trees had leaves. The houses had doors. It was wonderful.', 'night | luna@.5->.55 d.7 s1 spin, house@.2 d.8 s.8 none | motion stars', 'imagine: If you could float down from the sky, what would you want to see up close?'],
            ['Then, bonk! The Moon’s edge caught in the branches of a big oak tree. She wiggled left. She wiggled right. She was stuck! “Oh dear,” she said, in a voice like silver bells. “Oh dear, oh dear. I must be back in the sky before morning.”', 'night | tree@.55 d.5 s1.7 none, luna@.55 d.55 s.8 walk | stars', 'predict: Who do you think will come to help the Moon?'],
          ],
        },
      },
      {
        title: 'Meeting in the Garden',
        tellings: {
          mia: [
            ['Mia pulled on her slippers and her dressing gown and crept downstairs. She opened the back door very, very quietly. The garden was dark, except for the soft glow from the tree. The grass was cold and wet under her slippers.', 'night | house@.2 d.6 s1.3 none, mia@.2->.45 walk, tree@.8 d.6 s1.4 none | motion stars'],
            ['Suddenly, there was a WHOOSH and a THUMP. Something big and green landed right beside her, with wings and horns and a long swishy tail. A DRAGON! Mia opened her mouth to scream. Then the dragon said, “Sorry! I’m still learning to land!”', 'night | mia@.3, ember@.9->.65 d.1 hop flip | motion stars', 'predict: How do you think Mia will react to the dragon?'],
            ['Mia closed her mouth. The dragon didn’t look scary. She looked a bit embarrassed, actually. “I’m Ember,” said the dragon. “I think the moon needs help.” Mia smiled. “I’m Mia. And I think so too.”', 'night | mia@.3, ember@.68 d.1 flip, tree@.5 d.7 s1.3 none, luna@.5 d.75 s.5 | stars', 'think: Why wasn’t Mia scared anymore? | The dragon was tiny | *Ember was friendly and wanted to help too | Mia was dreaming >> Getting to know someone can change how we feel about them.'],
          ],
          ember: [
            ['Ember swooped down toward the garden. Landing was her worst skill. She tried to slow down. She flapped backward. She tucked in her tail. And then she landed with a big THUMP, right next to a girl in pyjamas.', 'night | ember@.8->.6 d.1 float, mia@.3 | motion stars'],
            ['“Please don’t scream,” Ember thought, closing her eyes. Humans usually screamed at dragons. But the girl didn’t scream. When Ember opened one eye, the girl was smiling at her. “I’m Mia,” she said. “Are you here for the moon too?”', 'night | ember@.62 d.1, mia@.3 hop | stars', 'find:mia Can you find Mia in her pyjamas?'],
            ['Ember felt her scales tingle with happiness. She had never had a human friend before. “Yes!” she said. “But I don’t know how to get it down. It’s very big, and I’m still small for a dragon.” Mia nodded. “Then we’ll figure it out together.”', 'night | ember@.62 d.1 hop, mia@.3, heart@.47 d.6 s.35 float | stars sparkles', 'imagine: If you met a dragon, what would you ask it first?'],
          ],
          luna: [
            ['From her spot in the branches, the Moon saw a little light switch on in a house. Then a door opened, and a small girl came out into the garden. The Moon held her breath. Would the girl be frightened?', 'night | luna@.5 d.8 s.8 walk, house@.2 d.6 s1.1 none, mia@.35 d.1 s.8 | stars'],
            ['Then a young dragon landed next to the girl, with a terribly clumsy thump. The Moon winced. But then something lovely happened: the girl and the dragon smiled at each other, and started talking in excited whispers.', 'night | luna@.5 d.85 s.7, mia@.35 d.1 s.8, ember@.65 d.1 s.9 | stars', 'think: Why does the Moon feel hopeful now? | She likes dragons | *She sees two friends coming to help | She is falling down >> Seeing others work together gives us hope.'],
            ['“Oh, I do hope they can help,” the Moon whispered. She couldn’t move, but she could still do one thing. She glowed a little brighter, just enough to light up the garden, so her two new friends could see where they were going.', 'night | luna@.5 d.6 s1.2 bob, mia@.25 d.1 s.7, ember@.75 d.1 s.8 | stars sparkles'],
          ],
        },
      },
      {
        title: 'The First Try',
        tellings: {
          mia: [
            ['“Climb on my back,” said Ember. “I’ll fly us up, and you can pull the moon free.” Mia had never ridden a dragon before. Ember’s scales were warm and smooth, like stones in the sun. “Hold on tight!” said Ember.', 'night | ember@.45 d.1 s1.1, mia@.45 d.05 s.55 | stars'],
            ['Up they went, wobbling left and right. Mia held on to Ember’s horns. The ground got farther and farther away. Mia’s tummy flipped. But then she looked up at the glowing moon, and she forgot to be scared.', 'night | ember@.2->.55 d.4 s.8 float, mia@.2->.55 d.45 s.4 float, tree@.75 d.6 s1.4 none | motion stars'],
            ['Mia reached out and grabbed the moon’s edge. She pulled. She pulled harder. It was smooth and cool and very, very heavy. The moon didn’t move. Only the branch creaked. “It’s no use,” Mia panted. “Pulling isn’t working.”', 'night | luna@.6 d.6 s.9 walk, mia@.4 d.45 s.5, tree@.6 d.5 s1.6 none | stars', 'think: What should they do when pulling doesn’t work? | Pull even harder forever | *Stop and think of a different idea | Go home >> When something doesn’t work, a new idea can help.'],
          ],
          ember: [
            ['Ember had never carried anyone before. Mia wasn’t heavy, but she wasn’t light either. Ember flapped harder. Then harder. Then HARDER. Her wings burned. Little puffs of smoke came out of her nose. “Almost… there…” she puffed.', 'night | ember@.4 d.4 s.9 hop, mia@.4 d.42 s.45 | stars'],
            ['They reached the top of the tree. Mia pulled and pulled at the moon. Ember tried to help by pushing with her nose. But Ember’s wings were getting so tired. She started to sink, lower and lower. “Mia,” she said, “I need to land!”', 'night | luna@.6 d.6 s.8 walk, ember@.4->.6 d.3 s.8 float, mia@.4->.6 d.35 s.4 | motion stars', 'predict: Will Ember be able to land safely?'],
            ['Ember glided down and landed, softer this time. She flopped onto the grass. “Sorry,” she sighed. “I’m not strong enough yet.” Mia patted her nose. “You flew all the way up there carrying me! That was amazing. We just need a better plan.”', 'night | ember@.6 d.1 none, mia@.3, tree@.85 d.6 s1.3 none | stars', 'think: How did Mia make Ember feel better? | She told her to try harder | *She noticed what Ember did well | She ignored her >> Noticing what someone did well helps them feel better.'],
          ],
          luna: [
            ['The Moon watched the dragon fly up, wobbling, with the girl holding on tight. Tiny hands grabbed her edge and pulled. It tickled! The Moon couldn’t help it. She giggled so hard that she shook, and the whole tree shook too.', 'night | luna@.5 d.5 s1.3 walk, mia@.3 d.35 s.5 | stars'],
            ['But the branch held her tight. The more the girl pulled, the more the branches seemed to hug her. The Moon looked closely. “Oh,” she thought. “The branches are curled around me like fingers. Pulling only makes them grip harder.”', 'night | tree@.5 d.5 s1.7 none, luna@.5 d.55 s.8 none | stars', 'think: Why isn’t pulling working? | The girl is too small | *The branches grip tighter when pulled | The Moon doesn’t want to leave >> Understanding why something isn’t working helps us fix it.'],
            ['The dragon flew back down, tired. The Moon felt sorry. “It’s not your fault,” she wanted to say. But Moons can only whisper, and they were too far away. “Maybe pulling isn’t the answer,” the Moon thought. “Maybe I need to be lifted.”', 'night | luna@.5 d.8 s.8, ember@.65 d.1 s.9 none, mia@.35 d.1 s.8 | stars', 'predict: How could the Moon be lifted instead of pulled?'],
          ],
        },
      },
      {
        title: 'A Clever Idea',
        tellings: {
          mia: [
            ['Mia sat on the grass next to Ember and thought very hard. She thought about everything she knew about the moon. It made the tides go up and down. It floated in the sky. Floated. The moon liked to float!', 'night | mia@.35, ember@.65 d.1 none, egg#FFD45C@.35 d.6 s.3 bob | stars'],
            ['Then she remembered something from school. Her teacher had shown them a hot-air balloon. Warm air goes up! That’s how balloons rise into the sky. Mia jumped up. “Ember! Can you breathe warm air? Not fire. Just warm.”', 'night | mia@.35 hop, balloon@.6 d.5 s.7 float, ember@.75 d.1 | stars sparkles', 'think: Why would warm air help lift the moon? | Warm air smells nice | *Warm air rises and can lift things up | It makes the tree grow >> Science facts can help solve real problems!'],
            ['“If you blow warm air under the moon,” Mia explained, drawing in the dirt with a stick, “it might lift it up, like a balloon. And then the branches will let go.” Ember’s eyes went wide. “Mia, that’s brilliant!”', 'night | mia@.35, ember@.65 d.1 hop, map@.5 d.1 s.5 none | stars', 'imagine: What other ways could you get the moon out of the tree?'],
          ],
          ember: [
            ['Warm air? Ember had LOTS of warm air. That was the one thing dragons were really good at. But there was a problem. Sometimes, when Ember got excited, her warm air turned into fire. And fire plus tree equals big trouble.', 'night | ember@.5 d.1, tree@.85 d.6 s1.3 none | stars', 'think: Why does Ember need to be careful? | She is sleepy | *Her breath could turn into fire and hurt the tree | Mia is scared >> Being careful is important when we use our strengths.'],
            ['“You can do it,” said Mia. “Just breathe slow, like you’re blowing on hot soup.” Ember closed her eyes. She took the deepest breath of her whole life. She thought calm thoughts: soft clouds, warm baths, sleeping kittens.', 'night | ember@.5 d.1 none, mia@.25, cloud@.75 d.7 s.6 float | stars'],
            ['And then she breathed out. Not fire. Not smoke. Just the gentlest, warmest breath a dragon had ever breathed. It swirled up into the tree like an invisible blanket. Ember opened one eye. Was it working?', 'night | ember@.25, cloud#FFE9A8@.4->.6 d.4 s.8 float, tree@.65 d.5 s1.6 none, luna@.65 d.55 s.7 | motion stars', 'predict: Do you think the warm air will work?'],
          ],
          luna: [
            ['Below the tree, the girl and the dragon were whispering together. The girl was drawing something in the dirt. The dragon was nodding. The Moon couldn’t hear them, but she could see their faces. They looked excited. They had a plan.', 'night | luna@.5 d.85 s.7, mia@.35 d.1 s.8, ember@.65 d.1 s.8 | stars'],
            ['Then something wonderful happened. A soft, warm breeze swirled up around the Moon, like a cosy blanket from below. It felt like a summer afternoon. The Moon sighed with happiness. She felt lighter. And lighter. And lighter still.', 'night | luna@.5 d.55 s1.1 float, cloud#FFE9A8@.5 d.4 s.8 float | stars sparkles', 'imagine: What does warm, gentle air feel like on your face?'],
            ['The branches loosened their grip, one by one, like fingers opening. The Moon began to rise, slowly, slowly, out of the oak tree. “Oh!” she said. “Oh, it’s working! Clever girl! Clever dragon!”', 'night | tree@.5 d.5 s1.6 none, luna@.5 d.6 s.9 float | motion stars sparkles'],
          ],
        },
      },
      {
        title: 'Home in the Sky',
        tellings: {
          mia: [
            ['Slowly, slowly, the moon wiggled free and floated up out of the tree. It rose higher and higher, back into the dark sky, until it was round and bright and exactly where it belonged. Silver light poured over the whole garden.', 'night | luna@.5 d.9 s1 float, mia@.3 hop, ember@.7 d.1 hop | motion stars'],
            ['Mia and Ember cheered and danced on the wet grass. Mia hugged Ember’s big green neck. “We did it!” she said. “You did the brave breathing.” Ember hugged her back with one wing. “You had the clever idea. We needed both.”', 'night | mia@.4 hop, ember@.6 d.1 hop, heart@.5 d.6 s.4 float | stars sparkles', 'think: Why did they need both of them? | One was enough | *Mia had the idea and Ember had the warm breath | They didn’t need anyone >> Teamwork uses everyone’s strengths.'],
            ['Mia crept back into bed. Moonlight came through her window again, making silver shapes on the floor. One shape looked just like a dragon. Mia smiled, closed her eyes, and fell asleep in about three seconds.', 'night | bed@.5 d.2 s1.1 none, mia@.45 d.15 s.6 none, luna@.85 d.85 s.6 | stars', 'imagine: What do you think Mia dreamed about that night?'],
          ],
          ember: [
            ['It worked! The moon floated up and up, back into the sky. Ember was so happy she did a loop-the-loop. Then another. Then she did one too many and landed in a rose bush. She didn’t even care. It was her best flying ever.', 'night | ember@.5 d.4 s.8 spin, luna@.75 d.9 s.7 float, bush@.3 d.2 s.7 none | stars sparkles'],
            ['Ember said goodbye to Mia and flew home. The night didn’t feel so dark now. The moon lit up the whole way, like it was saying thank you. Ember flew straight and steady, not wobbly at all.', 'night | ember@.1->.85 d.6 s.6 float, luna@.8 d.9 s.6 | motion stars', 'think: Why is Ember flying better now? | The wind changed | *She feels confident after helping | She grew bigger >> Doing something brave can help us feel more confident.'],
            ['Her mother was waiting at the cave. “Where have you been?” Ember grinned. “Helping the moon,” she said. “With a human friend.” Her mother raised an eyebrow. Then she smiled. “Well,” she said, “you’re not just a dragon who can fly. You’re a dragon who helps.”', 'night | mountain@.75 d.8 s1.4 none, dragon#3E8E5A@.6 d.2 s1.3, ember@.3 d.1 | stars sparkles'],
          ],
          luna: [
            ['Free at last! The Moon rose up, up, up, back to her place among the stars. The stars twinkled hello. “Where have you been?” they asked. “Down on Earth,” said the Moon. “I made two friends.”', 'space | luna@.5 d.5 s1.4 float | stars sparkles'],
            ['The Moon looked down at the little garden, now so far away. She could see the girl going back inside, and the dragon flying home. They had helped her without wanting anything back. The Moon felt warm all over, even in the cold of space.', 'night | luna@.5 d.8 s1 float, house@.3 d.9 s.6 none, ember@.7 d.8 s.4 float | stars', 'think: How does the Moon feel about her new friends? | Annoyed | *Thankful and warm inside | Sleepy >> Kindness makes us feel warm inside.'],
            ['And every night since then, the Moon shines a little extra on one small window, where a girl sleeps, and one dragon cave on the hill. If you look closely tonight, maybe she’ll shine a little extra on you too.', 'night | luna@.5 d.8 s1.2 bob, house@.25 d.3 s.9 none, mountain@.75 d.4 s1 none | stars sparkles', 'imagine: Look out of the window tonight. What do you think the Moon is watching?'],
          ],
        },
      },
    ],
  },
];

export const sagas: Saga[] = src.map((s) => ({
  id: s.id,
  title: s.title,
  blurb: s.blurb,
  povs: s.povs,
  scene: parseScene(s.scene, s.cast, `${s.id} cover`),
  chapters: s.chapters.map((ch, c) => ({
    title: ch.title,
    tellings: Object.fromEntries(Object.entries(ch.tellings).map(([pov, pages]) => [pov, compilePages(`${s.id} ch${c + 1} ${pov}`, s.cast, pages)])),
  })),
}));
