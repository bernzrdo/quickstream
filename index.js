const express = require('express');
const axios = require('axios').default; // iTunes Requests
const getColors = require('get-image-colors');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use((req, res, next)=>{
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res)=>res.render('index'));

app.get('/api', (req, res)=>{

    const { term } = req.query;

    axios.get('https://itunes.apple.com/search', {
        params: {
            term,
            country: 'PT',
            media: 'music',
            entity: 'album'
        }
    }).then(async response=>{

        const albums = response.data.results;

        res.json(albums.map(album=>({
            id: album.collectionId,
            title: album.collectionName,
            artist: album.artistName,
            art: album.artworkUrl60,
            explicit: album.collectionExplicitness == 'explicit',
            year: album.releaseDate.split('-')[0]
        })));

    }).catch(e=>res.end(`Error 500: ${e}`));

});

app.get(/^\/[0-9]+$/, (req, res)=>{

    const id = req.url.slice(1);

    axios.get('https://itunes.apple.com/lookup', {
        params: {
            id,
            country: 'PT',
            media: 'music',
            entity: 'song'
        }
    }).then(async response=>{

        if(response.data.resultCount == 0) return res.end('Error 404: Couldn\'t find that album.');
        
        const { results } = response.data;

        const album = results.find(i=>i.wrapperType == 'collection');
        const tracks = results.filter(i=>i.wrapperType == 'track').sort((a,b)=>a - b);

        const { data: buffer } = await axios.get(album.artworkUrl100, { responseType: 'arraybuffer' });
        const colors = await getColors(buffer, 'image/jpeg');
        
        const data = {
            album: {
                id,
                artist: album.artistName,
                title: album.collectionName,
                art: album.artworkUrl100.replace('100x100bb', '1200x1200bb'),
                explicit: album.collectionExplicitness == 'explicit',
                genre: album.primaryGenreName,
                year: album.releaseDate.split('-')[0],
                colors
            },
            tracks: tracks.map(track=>({
                number: track.trackNumber,
                title: track.trackName,
                audio: track.previewUrl,
                explicit: track.trackExplicitness == 'explicit'
            }))
        };

        res.render('album', { ...data });

    }).catch(e=>res.end(`Error 500: ${e}`));

});

app.listen(1024, ()=>console.log('Ready!'));