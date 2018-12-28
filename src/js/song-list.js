{
    let view = {
        el: '.song-list-wrapper',
        template: `
           <ul class="song-list">
           </ul>
        `,
        render(data) {
            $(this.el).html(this.template);
            let {songs} = data;
            let liList = songs.map((song) => {
                return $('<li></li>').attr("data-song-id", song.id)
                    .append(`
                    <svg class="icon icon-music" aria-hidden="true">
                        <use xlink:href="#icon-music"></use>
                    </svg>`)
                    .append(`
                <div class="song-info">
                   <p class="song-name">${song.name}</p>
                   <div class="row">
                       <svg class="icon icon-user" aria-hidden="true">
                            <use xlink:href="#icon-fonts-user"></use>
                       </svg>
                       <span class="song-singer">${song.singer}</span>
                   </div>
                </div>`);
            });

            $(this.el).find('.song-list').empty();
            liList.map((domLi) => {
                $(this.el).find('.song-list').append(domLi);
            });
        },
        addActive(dom) {
            $(dom).addClass('active').siblings('.active').removeClass('active');
        },

    };

    let model = {
        data: {
            songs: []
        },
        fetchAll() {
            var query = new AV.Query('Song');

            return query.find().then( (songs) => {
                //  获取所有歌曲列表，然后放到model数据里
                songs.map(song => {
                    let hash = {};
                    let {id, attributes} = song;
                    hash = {id, ...attributes};
                    this.data.songs.unshift(hash)
                })
                return songs;
            })
        }
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);

            this.model.fetchAll().then(() => {
                this.view.render(this.model.data)
            });

            this.bindEvents();

            // 订阅表单添加新歌曲，然后更新歌曲列表
            window.eventHub.on('create', (data) => {
                this.model.data.songs.unshift(data);
                this.view.render(this.model.data)
            });
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                let id = $(e.currentTarget).attr('data-song-id');
                let data = this.model.data.songs.forEach((song) => {
                    if(song.id === id) {
                        return song;
                    }
                })
                console.log(data);
                this.view.addActive(e.currentTarget);

            })
        }
    };

    controller.init(view, model)
}