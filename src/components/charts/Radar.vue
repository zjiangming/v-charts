<template>
    <div class="chart-container">
        <div v-if="data.title" class="chart-title">
            {{ data.title }}
        </div>
        <div :id="key" :style="{ width, height }" />
    </div>
</template>

<script>
import { deepClone, randomString } from '@/utils/common';
import DTMChart from './utils';

export default {
    name: 'DtRadar',
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        config: {
            type: Object,
            default: () => ({})
        },
        id: {
            type: String,
            default: ''
        },
        legend: {
            type: Boolean,
            default: false
        },
        grid: {
            type: Object,
            default: () => ({ rows: 1, cols: 1 })
        },
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '200px'
        }
    },
    data() {
        return {
            key: '',
            defaultOption: {
                title: {},
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    show: this.legend,
                    type: 'scroll',
                    padding: [0, 20],
                    pageIconColor: '#6C6CE5', // 正常颜色
                    pageIconInactiveColor: '#DDDFE2', // 非激活时颜色
                    pageIcons: { // 分页控制图标
                        // 水平布局
                        horizontal: ['M64 64v896h896V64H64z m526.4 672l-256-224 256-224v448z','M64 64v896h896V64H64z m369.6 224l256 224-256 224V288z']
                    },
                    pageButtonItemGap: 8, // 翻页按钮和页信息之间的间隔
                },
                radar: [
                    // { left: '5%', width: '40%' },
                ],
                series: []
            }
        }
    },
    computed: {
        chartGrid() {
            return Object.assign({ rows: 1, cols: 1}, this.grid);
        }
    },
    watch: {
        'data.source'() {
            this.$nextTick(() => {
                this.chart.init(this.initData());
            })
        }
    },
    mounted() {
        this.key = this.id || 'radar-' + randomString(8);
        this.chart = new DTMChart({ id: this.key });
        this.$nextTick(() => {
            this.chart.init(this.initData());
        })
    },
    methods: {
        initData() {
            const { dimensions, gridData, source } = this.data,
                options = deepClone(this.defaultOption),
                { legend, radar, series } = options;
            if (dimensions) {
                legend.data = typeof(dimensions) === 'string' ? this.getKeys(source, dimensions) : dimensions;
            } else {
                legend.data = null
            }
            options.radar = gridData;
            gridData.forEach((item, i) => {
                let d = {
                    name: this.data.title,
                    type: 'radar',
                    radarIndex: i,
                    areaStyle: {
                        show: true
                    },
                    data: []
                }
                if (item.indicator) {
                    source.forEach(t => {
                        d.data.push({
                            value: item.indicator.map(n => t[n.key] || 0)
                        })
                    })
                }
                series.push(d)
            })
            // 合并配置参数
            for (let key in this.config) {
                options[key] = Object.assign({}, options[key], this.config[key]);
            }
            console.log(options)
            return options;
        },
        getKeys(data = [], key) {
            let temp = {};
            data.forEach(t => {
                temp[t[key]] = true;
            })
            return Object.keys(temp);
        }
    }
}
</script>

