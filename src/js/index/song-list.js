{
    let view = {
        el: '#latest-songs-list',
        template: `
        <li class="song-info">
            <a class="song-link" href="./song.html?id=__id__">
                <div class="song-info-left">
                    <p class="song-name">__name__</p>
                    <p class="name-singer">
                        <svg class="icon icon-hot" aria-hidden="true">
                         <use xlink:href="#icon-hot"></use>
                        </svg>
                        <span>__name__ - __singer__</span>
                    </p>
                </div>
                <div class="song-info-right">
                    <svg class="icon icon-play" aria-hidden="true">
                        <use xlink:href="#icon-play"></use>
                    </svg>
                </div>
            </a>
        </li>
        `,
        render(data) {
            let needs = ['name', 'singer', 'id'];
            data.map((song) => {
                let html = this.template;
                needs.map( key => {
                    let regexp = new RegExp(`__${key}__`, 'g');
                    html = html.replace(regexp, song[key] || '');
                });
                $(this.el).append(html)
            })
        }

    };

    let model = {

        data: {
            songs: [],
        },

        fetchAll() {
            var query = new AV.Query('Song');

            return query.find().then( (songs) => {
                //  获取所有歌曲列表，然后放到model数据里
                songs.map(song => {
                    let hash = {};
                    let {id, attributes} = song;
                    Object.assign(hash, {id}, song.attributes);
                    this.data.songs.unshift(hash)
                })
                return songs;
            })
        },
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.model.fetchAll().then(() => {
                this.view.render(this.model.data.songs);
            });
        }
    };

    controller.init(view, model);
}