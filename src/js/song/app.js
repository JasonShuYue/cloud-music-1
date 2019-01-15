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
        render(data) {
            let song = data.song;
            let audio = $(this.el).find('audio')[0];
            if($(audio).attr('src') !== song.url) {
                $(audio).attr('src', song.url);
                audio.onended = ()=>{ window.eventHub.emit('songEnd', null) }
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