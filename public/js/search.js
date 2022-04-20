(()=>{

    const $search = $('.search');
    const $header = $('header');
    const $results = $('.results');

    var idleTimeout;

    $search.on('input', function(){

        this.value = this.value.trimStart();
        const term = this.value.trim();

        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(search, 1e3);

        if(term.length > 0) resetResults();
        $header.toggleClass('simple', term.length > 0);

    });

    $search.on('keyup', e=>{
        if(e.key != 'Enter') return;
        clearTimeout(idleTimeout);
        search();
    });

    function search(){

        const term = $search.val().trim();
        if(term.length == 0) return;

        $.ajax('/api', {
            data: { term },
            dataType: 'json',
            success: albums=>{

                resetResults();

                const $message = $results.find('.message');

                if(albums.length == 0){
                    $message.text('No results found!');
                    return;
                }

                $message.text('No more results!');

                for(const album of albums){

                    const $album = $('<a class="album"></a>');
                    $album.attr('href', album.id);

                    const $art = $('<div class="art"><i class="bi bi-music-note-beamed"></i></div>');
                    const img = new Image();
                    img.onload = ()=>{
                        $art.html('');
                        $art.css('background-image', `url('${album.art}')`);
                        img.remove();
                    }
                    img.src = album.art;
                    $album.append($art);

                    const $info = $('<div class="info"></div>');

                    const $titleExplicit = $('<div class="title-explicit"></div>');

                    const $title = $('<span class="title"></span>');
                    $title.text(album.title);
                    $titleExplicit.append($title);

                    if(album.explicit)
                        $titleExplicit.append('<i class="bi bi-explicit-fill"></i>');

                    $info.append($titleExplicit);

                    const $artistYear = $('<div class="artist-year"></div>');
                    $artistYear.text(`${album.artist} · ${album.year}`);
                    $info.append($artistYear);

                    $album.append($info);

                    $message.before($album);

                }

            },
            error: ()=>{

                resetResults();

                const $message = $results.find('.message');
                $message.addClass('error');
                $message.text('An error ocurred!');

            }
        });

    }

    function resetResults(){
        $results.html('<span class="message">Loading...</span>');
    }

})();