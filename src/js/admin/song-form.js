{
    let view = {
        el: '.admin-wrapper main',
        template: `
        
        <form class="upload-form">
            <p class="title">__type__歌曲</p>
            <label for="name">歌名:<input type="text" name="name" class="song-name" value="__name__"></label>
            <label for="singer">歌手:<input type="text" name="singer" class="singer-name" value="__singer__"></label>
            <label for="url">外链:<input type="text" name="url" class="song-url" value="__url__"></label>
            <label for="cover">封面:<input type="text" name="cover" class="cover-url" value="__cover__"></label>
            <label for="url">歌词:<textarea name="lyrics"  class="song-lyrics">__lyrics__</textarea></label>
            <button type="submit" class="submit-bt">保存</button>
            <!--<button id="delete-btn" class="delete-bt">删除</button>-->
        </form>
        `,
        render(data = {}) {
            let html = this.template;
            let placeHolder = ['name', 'singer', 'url', 'type', 'cover', 'lyrics'];

            placeHolder.map(key => {
                if(key === "type") {
                    html = html.replace(`__${key}__`, data[key] === 'update' ? '编辑' : '新建');
                } else {
                    html = html.replace(`__${key}__`, data[key] || '');
                }
            });

            $(this.el).html(html);
        },
        reset() {
            this.render({});
        },
        addHidden(dom) {
            $(dom).addClass('hidden');
        },
        removeClass(dom) {
            $(dom).removeClass('hidden');
        }
    };

    let model = {
        data: {
            'name': '',
            'singer': '',
            'url': '',
            'id': '',
            'type': '',
            'cover': '',
            'lyrics': '',
        },


        create(data = {}) {
            var Song = AV.Object.extend('Song');
            var song = new Song();
            for(let key in data) {
                song.set(key, data[key]);
            }
            return song.save().then( (newSong) => {
                // 成功保存之后，执行其他逻辑.
                let {id, attributes} = newSong;
                Object.assign(this.data, {...attributes, id});
            }, function (error) {
                // 异常处理
                console.error('Failed to create new object, with error message: ' + error.message);
            });
        },

        update(data = {}) {
            let {id} = data;
            // 第一个参数是 className，第二个参数是 objectId
            var song = AV.Object.createWithoutData('Song', id);

            for(let key in data) {
                // 修改属性
                song.set(key, data[key]);
            }

            // 保存到云端
            return song.save();
        }
    };

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.view.render(this.model.data);
            this.bindEvents();
            window.eventHub.on('upload', (data) => {
                Object.assign(this.model.data, data)
                this.view.render(this.model.data);
            });

            window.eventHub.on('select', (data) => {
                // this.model.data = data;
                Object.assign(this.model.data, data);
                this.view.render(this.model.data);
            });
        },
        bindEvents() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault();
                let needs = ['name', 'singer', 'url', 'cover', 'lyrics'];
                let hash = {};
                needs.map(key => {
                    let value = $(this.view.el).find(`[name=${key}]`).val();
                    hash[key] = value;
                });
                Object.assign(this.model.data, hash);

                if(this.model.data.type !== "update") {
                    this.model.create(this.model.data)
                        .then(() => {
                            this.view.reset();
                            window.eventHub.emit('create', this.model.data);
                        });
                } else {
                    this.model.update(this.model.data)
                        .then(() => {
                            this.view.reset();
                            window.eventHub.emit('update', this.model.data);
                        });
                    this.view.reset();
                }

            })
        }

    };

    controller.init(view, model);
}
