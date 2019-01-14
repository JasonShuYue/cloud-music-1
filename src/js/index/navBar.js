{
    let view = {
        el: '#nav-bar',
        activeTab(node) {
            $(node).addClass('active')
                .siblings().removeClass('active');
        }
    };
    let controller = {
        init(view) {
            this.view =  view;
            this.bindEvents();
        },
        bindEvents() {
            $(this.view.el).on('click', '.nav-bar-item', (e) => {
                let current = e.currentTarget;
                this.view.activeTab(current);
                let tabName = $(current).attr('data-page-name');

                window.eventHub.emit('selectedTab', tabName);
                // console.log(tabName)
            })
        }
    };

    controller.init(view);
}