<template>
    <div class="chart-container">
        <div v-if="empty || chartEmpty" class="chart-empty">
            <Svgicon class="chart-empty__icon" icon="icon-emptycondition1" />
            <p class="chart-empty__tips">
                暂无数据
            </p>
        </div>
        <template v-else>
            <div v-if="data.title" class="chart-title">
                {{ data.title }}
            </div>
            <div :id="key" :style="{ width, height }" />
        </template>
    </div>
</template>

<script>
import { deepClone, randomString } from '@/utils/common';
import DTMChart from './utils';

export default {
    name: 'DtPie',
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
            default: true
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
        },
        empty: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            key: '',
            chartEmpty: this.empty,
            defaultOption: {
                title: {},
                legend: {
                    show: this.legend,
                    type: 'scroll',
                    orient: 'vertical',
                    x: 'left',
                    y: 'middle',
                    padding: [0, 20],
                    pageIconColor: '#6C6CE5', // 正常颜色
                    pageIconInactiveColor: '#DDDFE2', // 非激活时颜色
                    pageIcons: { // 分页控制图标
                        // 水平布局
                        horizontal: ['M64 64v896h896V64H64z m526.4 672l-256-224 256-224v448z','M64 64v896h896V64H64z m369.6 224l256 224-256 224V288z']
                    },
                    pageButtonItemGap: 8, // 翻页按钮和页信息之间的间隔
                    formatter: name => {
                        return name.length > 10 ? name.slice(0, 10) + '...' : name;
                    }
                },
                tooltip: {
                    show: false,
                    trigger: 'item',
                },
                grid: [
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
        'data.source'(val) {
            if (!val || val.length == 0) this.chartEmpty = true;
            else this.chartEmpty = false;
            this.$nextTick(() => {
                !this.chartEmpty && this.chart.init(this.initData());
            })
        }
    },
    mounted() {
        const { source } = this.data;
        this.chartEmpty = source ? !source.length : true;
        this.key = this.id || 'pie-' + randomString(8);
        this.chart = new DTMChart({ id: this.key });
        this.$nextTick(() => {
            !this.chartEmpty && this.chart.init(this.initData());
        })
    },
    methods: {
        initData() {
            const { dimensions, formatter, rich, gridData, source } = this.data,
                options = deepClone(this.defaultOption),
                { legend, grid, series } = options;
            if (dimensions) {
                legend.data = typeof(dimensions) === 'string' ? this.getKeys(source, dimensions) : dimensions;
            } else {
                legend.data = null
            }
            gridData.forEach((item, i) => {
                let d = {
                    name: i,
                    type: 'pie',
                    radius: [
                        100/(this.chartGrid.cols*i + 1)/2 + '%',
                        (100/(this.chartGrid.cols*i + 1)/2 + 15) + '%'
                    ],
                    center: [
                        100/(this.chartGrid.cols*i + 1)/2 + '%',
                        100/(this.chartGrid.rows*i + 1)/2 + '%'
                    ],
                    label: {
                        normal: {
                            show: false,
                            position: 'center',
                            formatter: formatter,
                            rich: rich
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '14',
                            }
                        }
                    },
                    data: []
                }
                d.data = source.map(t => ({ name: t[item.label], value: t[item.value], percent: t[item.percent] }));
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

