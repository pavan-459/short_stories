import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Alert } from 'react-native';
import { displayTitle, pictureBase64, Story } from './storage';
import { backdrops, Scene } from './Scene';
import { avatarSvg } from './avatars';

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

// A flat version of a drawn scene for the PDF: the backdrop's sky and ground with the actors in a row.
let svgId = 0;
function sceneHtml(scene: Scene) {
  const p = backdrops[scene.bg];
  const actors = scene.actors.map((a) => avatarSvg(a.look, `a${svgId++}`, Math.round(140 * (1 - (a.depth ?? 0) * 0.45) * (a.size ?? 1)), a.flip)).join('');
  return `<div class="scene" style="background: linear-gradient(${p.sky[0]}, ${p.sky[1]} 62%, ${p.mid} 62%, ${p.ground});">${actors}</div>`;
}

function mimeFor(name: string) {
  return name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
}

// Turns a story into a picture-book PDF and opens the system share sheet
// (Messages, WhatsApp, Mail, Save to Files, AirDrop, Print...). Nothing goes through our servers.
export async function shareStoryAsPdf(story: Story) {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert('Sharing is not available on this device');
    return;
  }

  const title = escape(displayTitle(story));
  const author = story.author.trim() ? `by ${escape(story.author.trim())}` : '';

  // iOS can't load local file URLs while printing, so pictures are inlined as base64.
  const pages: string[] = [];
  for (const page of story.pages) {
    let img = '';
    if (page.image) {
      try {
        const b64 = await pictureBase64(page.image);
        img = `<img src="data:${mimeFor(page.image)};base64,${b64}" />`;
      } catch {
        // missing picture: print the text only
      }
    }
    if (!img && page.scene) img = sceneHtml(page.scene);
    pages.push(`<section class="page">${img}<p>${escape(page.text).replace(/\n/g, '<br/>')}</p></section>`);
  }

  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  @page { margin: 0; }
  body { margin: 0; font-family: -apple-system, 'Helvetica Neue', Roboto, sans-serif; color: #3A2E4D; }
  section { height: 792px; box-sizing: border-box; padding: 48px; page-break-after: always;
            display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .cover { background: ${story.color}; }
  .cover h1 { font-size: 48px; margin: 0 0 16px; }
  .cover h2 { font-size: 24px; font-weight: 600; margin: 0; }
  .page img { max-width: 100%; max-height: 480px; border-radius: 24px; object-fit: cover; }
  .scene { width: 100%; height: 420px; border-radius: 24px; display: flex; align-items: flex-end; justify-content: space-evenly; padding-bottom: 30px; overflow: hidden; box-sizing: border-box; }
  .page p { font-size: 26px; line-height: 1.4; margin-top: 32px; }
  .end { page-break-after: auto; }
  .end h1 { font-size: 44px; }
  .made { font-size: 14px; color: #8E80A3; }
</style></head><body>
  <section class="cover"><h1>${title}</h1><h2>${author}</h2></section>
  ${pages.join('\n')}
  <section class="end"><h1>The End</h1><p class="made">Made with Storypop</p></section>
</body></html>`;

  const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });

  // Give the file a friendly name instead of the random one in the cache.
  const safeName = displayTitle(story).replace(/[^a-z0-9 _-]/gi, '').trim().slice(0, 40) || 'Story';
  const named = new File(Paths.cache, `${safeName}.pdf`);
  if (named.exists) named.delete();
  await new File(uri).move(named);

  await Sharing.shareAsync(named.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: displayTitle(story) });
}
