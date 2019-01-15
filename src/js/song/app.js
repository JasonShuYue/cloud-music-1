{
    let view = {
        el: '#song-wrapper',
        play() {
            let audio = $(this.el).find('audio')[0];
            audio.play();
        },
        pause() {
            let audio = $(this.el).find('audio')[0];
            audio.pause();
        },
        showLyrics(currentTime) {
            let domSet = $(this.el).find('.lyric .lines p');
            let index = 0;

            if(currentTime > domSet.eq(domSet.length - 1).attr('data-time')) {
                index = domSet.length - 1;
            } else {
                for(let i = 0; i < domSet.length; i++) {
                    if(currentTime >= domSet.eq(i).attr('data-time')) {
                        continue;
                    } else {
                        index = i - 1;
                        break;
                    }
                }
            }
            console.log(index)
            this.activeLyrics(index);
        },
        activeLyrics(index) {
            let pHight = $(this.el).find('.lyric .lines p')[0].clientHeight;
            $(this.el).find('.lyric .lines p').eq(index).addClass('active')
                .siblings().removeClass('active');

            $(this.el).find('.lyric .lines').css('transform', `translateY(-${pHight * index}px)`)
        },
        render(data) {
            let song = data.song;
            let audio = $(this.el).find('audio')[0];
            if($(audio).attr('src') !== song.url) {
                $(audio).attr('src', song.url);
                audio.onended = ()=>{ window.eventHub.emit('songEnd', null) };
                audio.ontimeupdate = () => {
                    this.showLyrics(audio.currentTime);
                };
            }
            $(this.el).find('.img-bg').css('background-image', `url(${song.cover})`);
            $(this.el).find('.cover').attr('src', song.cover);

            if(data.status === "playing") {
                $(this.el).find('.disc-container').addClass('playing');
            } else {
                $(this.el).find('.disc-container').removeClass('playing');
            }

            // song-description
            $(this.el).find('.song-description .song-name').text(song.name);
            $(this.el).find('.song-description .song-singer').text(song.singer);

            // lyrics-part
            let lyricsArr = data.song.lyrics.split('\n').filter(v => v);


            lyricsArr.map((string) => {
                let p = document.createElement('p')
                let regex = /\[([\d:.]+)\](.+)/
                let matches =string.match(regex)
                if(matches){
                    p.textContent = matches[2]
                    let time = matches[1]
                    let parts = time.split(':')
                    let minutes = parts[0]
                    let seconds = parts[1]
                    let newTime = parseInt(minutes,10) * 60 + parseFloat(seconds,10)
                    p.setAttribute('data-time', newTime)
                }else{
                    p.textContent = string
                }
                $(this.el).find('.lyric>.lines').append(p)
            })




        }
    };

    let model = {
        data: {
            song: {
                name: '',
                singer: '',
                id: '',
                url: '',
                cover: '',
            },
            status: 'paused'
        },
        fetch() {
            let query = new AV.Query('Song');
            let search = window.location.search;
            let id = '';
            if(search.includes('?')) {
                let index = search.indexOf('?');
                search = search.substring(index + 1);
            }
            let arr = search.split('&').filter(v => v);

            for(let i = 0; i < arr.length; i++) {
                let kv = arr[i].split('=');
                let key = kv[0];
                let value = kv[1];
                if(key === 'id') {
                    id = value;
                    break;
                }
            }

            return query.get(id).then((song) => {
                let { attributes } = song;
                Object.assign(this.data.song, {...attributes});
            }, function (error) {
                // 异常处理
            });


        }

    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.model.fetch().then(() => {
                this.view.render(this.model.data);
            });

            window.eventHub.on('songEnd', (data) => {
                this.model.data.status = 'paused';
                this.view.render(this.model.data);
            });
            this.bindEvents();

        },
        bindEvents() {
            $(this.view.el).on('click', '.icon-container', (e) => {
                // 通过改变data里面的status状态来改变UI
                let status = this.model.data.status;
                if(status === "playing") {
                    this.model.data.status = 'paused';
                    this.view.pause();
                } else {
                    this.model.data.status = 'playing';
                    this.view.play();
                }
                this.view.render(this.model.data);
            })
        }
    };

    controller.init(view, model);
}