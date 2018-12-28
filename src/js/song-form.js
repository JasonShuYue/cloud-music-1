{
    let view = {
        el: '.admin-wrapper main',
        template: `
        <form class="upload-form">
            <label for="name">歌名:<input type="text" name="name" class="song-name" value="__name__"></label>
            <label for="singer">歌手:<input type="text" name="singer" class="singer-name" value="__singer__"></label>
            <label for="url">外链:<input type="text" name="url" class="song-url" value="__url__"></label>
            <button type="submit" class="submit-bt">保存</button>
        </form>
        `,
        render(data = {}) {
            let html = this.template;
            let placeHolder = ['name', 'singer', 'url'];

            placeHolder.map(key => {
                html = html.replace(`__${key}__`, data[key] || '');
            });

            $(this.el).html(html);
        },
        reset() {
            this.render({});
        }
    };

    let model = {
        data: {
            'name': '',
            'singer': '',
            'url': '',
            'id': ''
        },


        create(data = {}) {

            // 声明一个 Todo 类型
            var Song = AV.Object.extend('Song');
            // 新建一个 Todo 对象
            var song = new Song();
            for(let key in data) {
                song.set(key, data[key]);
            }
            return song.save().then( (newSong) => {
                // 成功保存之后，执行其他逻辑.
                let {id, attributes} = newSong;
                Object.assign(this.data, {id, ...attributes});
            }, function (error) {
                // 异常处理
                console.error('Failed to create new object, with error message: ' + error.message);
            });


        }
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindEvents();
            window.eventHub.on('upload', (data) => {
                this.view.render(data);
            });
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault();
                let needs = ['name', 'singer', 'url'];
                let hash = {};
                needs.map(key => {
                    let value = $(this.view.el).find(`input[name=${key}]`).val();
                    hash[key] = value;
                });
                this.model.data = hash;
                this.model.create(this.model.data)
                    .then(() => {
                        this.view.reset();
                        window.eventHub.emit('create', this.model.data);
                    });
            })
        }

    };

    controller.init(view, model);
}
