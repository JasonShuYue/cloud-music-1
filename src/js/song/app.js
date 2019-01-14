{
    let view = {
        el: '#song-wrapper',
        template: `
            <audio controls>
              <source src=__url__ >
            </audio>
        `,
        render(data) {
            let html = this.template;
            html = html.replace('__url__', data.url || '');
            $(this.el).html(html);
        }
    };

    let model = {
        data: {
            name: '',
            singer: '',
            id: '',
            url: '',
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
                Object.assign(this.data, {...attributes});
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
                this.view.render(this.model.data)
            });
        }
    };

    controller.init(view, model);
}