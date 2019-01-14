{
    let view = {
        el: '#main-content',
    };
    let model = {
        songs: []
    };
    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            $(this.view.el).find(".page-1").addClass('active');

            window.eventHub.on('selectedTab', (data) => {
                let tabName = data;
                $(this.view.el).find(`.${tabName}`).addClass('active')
                    .siblings().removeClass('active');
            })
        },
    };

    controller.init(view, model);
}