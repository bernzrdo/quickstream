(()=>{

    var lastScroll = 0;
    onscroll = ()=>{
        $('header').toggleClass('small', lastScroll < scrollY);
        lastScroll = scrollY;
    }
    onscroll();

    /** @type {HTMLAudioElement} */
    var curr;
    var currIndex;
    var playingAlbum = false;

    $('.play-album').on('click', ()=>{
        playingAlbum = true;
        play(0);
    });

    function play(index){

        if(curr) stop();

        curr = audios[index];
        curr.ontimeupdate = function(){

            if(playingAlbum){

                var progress = currIndex * 100 / audios.length;
                var songWidth = 100 / audios.length;
                progress += curr.currentTime * songWidth / Math.min(curr.duration, 10);

            }else{
                var progress = curr.currentTime * 100 / curr.duration;
            }
            $('.bar').css('width', `${progress}%`);

            if(!playingAlbum || this.currentTime < 10) return;

            if(currIndex < audios.length) play(++currIndex);
            else stop();

        }
        curr.onended = function(){
            stop();
        }
        curr.play();
        currIndex = index;

        $(`.track:nth-child(${index + 1})`).addClass('playing');

        $('.play-album').hide();

        $('.prev').attr('disabled', index == 0);
        $('.next').attr('disabled', index == audios.length - 1);

        $('.player').show();
        $('.progress').show();

    }

    function stop(){

        curr.pause();
        curr.currentTime = 0;
        curr = null;

        $('.track.playing').removeClass('playing');

        $('.play-album').show();
        $('.player').hide();
        $('.progress').hide();

    }

    $('.prev').on('click', ()=>{
        if(currIndex > 0) play(--currIndex);
    });

    $('.stop').on('click', stop);

    $('.next').on('click', ()=>{
        if(currIndex < audios.length) play(++currIndex);
    });

    $('.track').on('click', function(){
        playingAlbum = false;
        play($(this).index());
    });

})();