<template>
    <div class="chart-container">
        <ChartItem v-for="(item, index) in chartConfig" :key="index" :title="item.name" :config="item" />
    </div>
</template>

<script>
import { setElementClass } from '../utils/common.js';
import ChartItem from './ChartItem';

export default {
    components: {
        ChartItem
    },
    data() {
        return {
            detail: {
                config: [
                    { id: 'c1', name: '图表1', left: 0, top: 0, width: 6, height: 32 },
                    { id: 'c2', name: '图表2', left: 4, top: 32, width: 4, height: 32 },
                    { id: 'c3', name: '图表3', left: 6, top: 0, width: 6, height: 32 },
                ]
            },
            container: {
                width: '',
                height: ''
            },
            step: {
                col: 0,
                row: 10,
                range: 12,
                margin: 10,
            }
        }
    },
    computed: {
        chartConfig() {
            let { col, row, margin } = this.step;
            let list = this.detail.config || [];
            return list.map(item => {
                return {
                    ...item,
                    left: item.left ? item.left*col : 0,
                    top: item.top ? item.top*row : 0,
                    width: item.width ? item.width*col - margin : 0,
                    height: item.height ? (item.height-1)*row : 0,
                }
            })
        }
    },
    mounted() {
        let container = this.container,
            { range, margin } = this.step,
            dom = document.getElementsByClassName('chart-container')[0];
        container.width = dom.clientWidth;
        container.height = dom.clientHeight;
        this.$set(this.step, 'col', container.width ? (container.width + margin) / range : 0);
        window.addEventListener('resize', () => {
            container.width = dom.clientWidth;
            container.height = dom.clientHeight;
            this.$set(this.step, 'col', container.width ? (container.width + margin) / range : 0);
        })
        this.drag(dom);
    },
    methods: {
        drag(dom) {
            let dragged = null,
                config = this.detail.config,
                position = { x: '', y: '' },
                moving = { left: '', top: '' };
            let elem = document.createElement('div');
            elem.className = 'chart-placeholder';
            // 移动事件
            let dragStart = (event) => {
                let { clientX, clientY } = event || {};
                dragged = event.target;
                setElementClass(dom.getElementsByClassName('chart-col'), 'active', false);
                while(dragged && dragged.className && dragged.className.indexOf('chart-col') == -1) {
                    dragged = dragged.parentNode;
                }
                if (!dragged.className || dragged.className.indexOf('chart-col') == -1) {
                    dragged = null;
                }
                if (dragged) {
                    position = {
                        x: clientX - dragged.offsetLeft,
                        y: clientY - dragged.offsetTop
                    }
                    dragged.style.opacity = .8;
                    setElementClass(dragged, 'active', true);
                    this.chartConfig.forEach(t => {
                        if (t.id == dragged.id) {
                            elem.style.left = t.left + 'px';
                            elem.style.top = t.top + 'px';
                            elem.style.width = t.width + 'px';
                            elem.style.height = t.height + 'px';
                        }
                    })
                    config.forEach(t => {
                        if (t.id == dragged.id) {
                            moving = JSON.parse(JSON.stringify(t));
                        }
                    })
                    dom.append(elem);
                }
                dom.onmousemove = dragMove;
                window.console.log('start', position);
            },
            dragEnd = () => {
                window.console.log('end')
                let { col, row } = this.step;
                if (dragged) {
                    dragged.style.opacity = "";
                    setElementClass(dragged, 'dragging', false);
                    dragged.style.left = (moving.left*col) + 'px';
                    dragged.style.top = (moving.top*row) + 'px';
                    config.forEach(t => {
                        if (t.id == moving.id) {
                            Object.assign(t, moving);
                        }
                    })
                    dom.removeChild(elem);
                }
                dom.onmousemove = null;
                dragged = null;
                moving = {};
            },
            dragMove = (event) => {
                let { clientX, clientY } = event || {},
                    { col, row } = this.step;
                if (dragged) {
                    dragged.style.left = (clientX - position.x) + 'px';
                    dragged.style.top = (clientY - position.y) + 'px';

                    moving.left = Math.round((clientX - position.x)/col);
                    if (moving.left + moving.width > 12) moving.left = 12 - moving.width;
                    if (moving.left < 0) moving.left = 0;
                    moving.top = Math.round((clientY - position.y)/row);
                    if (moving.top < 0) moving.top = 0;

                    // this.sortGrid(moving);
                    elem.style.left = moving.left*col + 'px';
                    elem.style.top = moving.top*row + 'px';

                    setElementClass(dragged, 'dragging', true);
                }
            }

            // 点击开始
            dom.onmousedown = dragStart;
            // 点击结束
            dom.onmouseup = dragEnd;
        },
        sortGrid(moving, data) {
            // if (moving.left < moving.width) moving.left = 0;
            if (moving.top < moving.height) moving.top = 0;

            let config = JSON.parse(JSON.stringify(data || this.detail.config));
            config.forEach(col => {
                if (col.id == moving.id) Object.assign(col, moving);
                else {
                    if (col.left + col.width > moving.left && col.left < moving.left + moving.width) {
                        col.top += (moving.top + moving.height);
                    } else if (col.top + col.height > moving.top + moving.height/2 && col.top < moving.top + moving.height) {
                        col.top += (moving.top + moving.height);
                    }
                    window.console.log(col)
                }
            })
            this.$set(this.detail, 'config', config);
            window.console.log('sort', moving, config)
        },
        getGrid(config) {
            let chart = config || this.detail.config,
                next = true,
                minTop = 0,
                grid = [];
            // 分级
            while(next) {
                let minHeight = 0, s = [];
                if (grid.length == 0) {
                    s = chart.filter(t => {
                        if (t.top == 0) {
                            minHeight = minHeight ? (t.height < minHeight ? t.height : minHeight) : t.height;
                            return true;
                        }
                    });
                } else {
                    chart.forEach(t => {
                        if (t.top >= minTop) {
                            minHeight = minHeight ? (t.height < minHeight ? t.height : minHeight) : t.height;
                        }
                    })
                    s = chart.filter(t => {
                        if (t.top >= minTop && t.top < minTop + minHeight) {
                            return true;
                        }
                    });
                }
                if (s.length > 0) {
                    s.sort((a, b) => a.left - b.left);
                    grid.push(s);
                } else {
                    next = false;
                }
                minTop += minHeight;
            }
            window.console.log(grid)
            return grid;
        }
    }
}
</script>

<style lang="scss">
.chart-container {
    background-color: #f0f3f4;
    min-height: 800px;
    position: relative;
    overflow: hidden;
    .chart-placeholder {
        position: absolute;
        background-color: #df6137;
        opacity: 0.6;
        z-index: 0;
        transition: all 0.2s ease;
        transition-property: left,top;
    }
}
</style>


