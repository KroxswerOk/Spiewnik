
/*
Simple PWA Songbook (no frameworks).
- ChordPro-style parsing: [C]Tekst
- Transposition +/- 1 semitone, -6..+6 limited in UI
- Search by title/author/tags/body
- Import/Export JSON
*/
const DATA_URL = '/data/songs.json';

let store = {
  songs: [],
  search: '',
  showChords: true,
  transpose: 0,
  fontSize: 18
};

async function loadBundled(){
  try{
    const res = await fetch(DATA_URL);
    store.songs = await res.json().then(j => j.songs || []);
    renderList();
  }catch(e){ console.error('loadBundled', e) }
}

function renderList(){
  const panel = document.getElementById('listPanel');
  panel.innerHTML = '';
  const q = store.search.trim().toLowerCase();
  const list = store.songs.filter(s => {
    if(!q) return true;
    return (s.title||'').toLowerCase().includes(q) ||
           (s.author||'').toLowerCase().includes(q) ||
           (s.tags||[]).join(' ').toLowerCase().includes(q) ||
           (s.body||'').toLowerCase().includes(q);
  }).sort((a,b)=>a.title.localeCompare(b.title,'pl'));
  if(list.length===0){ panel.innerHTML = '<p style="color:var(--muted)">Brak wyników</p>'; return }
  list.forEach(song=>{
    const el = document.createElement('div');
    el.className='songCard';
    el.innerHTML = `<h3>${escapeHtml(song.title)}</h3><p>${escapeHtml(song.author||'')} ${song.tags && song.tags.length? '· '+song.tags.join(', '):''}</p>`;
    el.onclick = ()=> showSong(song);
    panel.appendChild(el);
  })
}

function showSong(song){
  document.getElementById('detailPanel').classList.remove('empty');
  document.getElementById('songTitle').textContent = song.title;
  document.getElementById('songMeta').innerHTML = `<small>${song.author||''} ${song.tags? ' · ' + song.tags.join(', '):''}</small>`;
  document.getElementById('songBody').innerHTML = renderChordPro(song.body || '', store.transpose, store.showChords);
  document.getElementById('songBody').style.fontSize = store.fontSize + 'px';
}

/* --- ChordPro rendering + transpose --- */
const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLAT_MAP = {"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};

function normalizeNote(n){
  if(FLAT_MAP[n]) return FLAT_MAP[n];
  return n;
}

function transposeNote(root, steps){
  root = normalizeNote(root);
  const idx = NOTES.indexOf(root);
  if(idx===-1) return root;
  const newIdx = (idx + steps + 12*100) % 12;
  return NOTES[newIdx];
}

function transposeChordToken(token, steps){
  // token like C, C#m, D7, Fsus4, G/B
  // handle slash chords and simple root parsing
  if(!token) return token;
  // split on slash
  const parts = token.split('/');
  const main = parts[0];
  const rest = parts.slice(1).join('/');
  // root is letters and optional #/b
  const m = main.match(/^([A-Ga-g])(#{1}|b{1})?(.+)?$/);
  if(!m) return token;
  const root = m[1].toUpperCase() + (m[2]||'');
  const suffix = m[3] || '';
  const transRoot = transposeNote(root, steps);
  if(rest) {
    const transBass = transposeNote(rest.toUpperCase(), steps);
    return transRoot + suffix + '/' + transBass;
  }
  return transRoot + suffix;
}

function renderChordPro(body, steps, showChords){
  const lines = body.split(/\r?\n/);
  const out = [];
  for(const line of lines){
    if(!line.trim()){ out.push(''); continue; }
    let lyrics = '';
    const chords = [];
    for(let i=0;i<line.length;i++){
      if(line[i] === '['){
        const close = line.indexOf(']', i);
        if(close>i){
          const token = line.substring(i+1, close);
          const trans = transposeChordToken(token, steps);
          chords.push({pos: lyrics.length, text: trans});
          i = close;
          continue;
        }
      }
      lyrics += line[i];
    }
    if(showChords && chords.length){
      // build monospace chord line
      let arr = Array(Math.max(lyrics.length, (chords[chords.length-1].pos||0)+4)).fill(' ');
      chords.forEach(span=>{
        for(let k=0;k<span.text.length;k++){
          if(span.pos + k < arr.length) arr[span.pos + k] = span.text[k];
          else arr.push(span.text[k]);
        }
      });
      out.push('<div class="chordLine">'+escapeHtml(arr.join(''))+'</div>');
      out.push('<div>'+escapeHtml(lyrics)+'</div>');
    } else {
      out.push('<div>'+escapeHtml(lyrics)+'</div>');
    }
  }
  return out.join('');
}

/* --- helpers --- */
function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

/* --- UI wiring --- */
document.getElementById('search').addEventListener('input', e=>{ store.search = e.target.value; renderList(); });
document.getElementById('toggleChords').addEventListener('change', e=>{ store.showChords = e.target.checked; const title = document.getElementById('songTitle').textContent; const song = store.songs.find(s=>s.title===title); if(song) showSong(song); });
document.getElementById('down').addEventListener('click', ()=>{ if(store.transpose> -12){ store.transpose--; document.getElementById('transposeVal').textContent = store.transpose; const title=document.getElementById('songTitle').textContent; const song = store.songs.find(s=>s.title===title); if(song) showSong(song); } });
document.getElementById('up').addEventListener('click', ()=>{ if(store.transpose< 12){ store.transpose++; document.getElementById('transposeVal').textContent = store.transpose; const title=document.getElementById('songTitle').textContent; const song = store.songs.find(s=>s.title===title); if(song) showSong(song); } });
document.getElementById('fontSize').addEventListener('input', e=>{ store.fontSize = +e.target.value; document.getElementById('songBody').style.fontSize = store.fontSize + 'px'; });

// Import/Export
document.getElementById('importBtn').addEventListener('click', ()=>document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', async (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const parsed = JSON.parse(txt);
    if(parsed.songs && Array.isArray(parsed.songs)){ store.songs = parsed.songs; renderList(); alert('Zaimportowano śpiewnik'); }
    else alert('Nieprawidłowy format JSON');
  }catch(err){ alert('Błąd podczas importu: '+err) }
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify({version:1,songs:store.songs},null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'spiewnik.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Init
loadBundled();
