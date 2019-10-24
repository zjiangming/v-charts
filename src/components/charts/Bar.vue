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
    name: 'DtBar',
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
                legend: {
                    show: this.legend
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line', // line、shadow
                    },
                    formatter: this.data.tips,
                    // backgroundColor: 'rgba(255, 255, 255, .9)',
                    // borderColor: '#ebeef5',
                    // textStyle: {
                    //     color: '#333'
                    // },
                    // extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, .2); border-radius: 2px;'
                },
                grid: [
                    // { left: '5%', width: '40%' },
                ],
                xAxis: [
                    // { type: 'category', gridIndex: 0 },
                ],
                yAxis: [
                    // { gridIndex: 0 },
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
        this.key = this.id || 'bar-' + randomString(8);
        this.chart = new DTMChart({ id: this.key });
        this.$nextTick(() => {
            !this.chartEmpty && this.chart.init(this.initData());
        })
    },
    methods: {
        initData() {
            const { dimensions, tips, reverse, gridData, source } = this.data,
                options = deepClone(this.defaultOption),
                { legend, grid, xAxis, yAxis, series } = options;
            if (dimensions) {
                legend.data = typeof(dimensions) === 'string' ? this.getKeys(source, dimensions) : dimensions;
            } else {
                legend.data = null
            }
            gridData.forEach((item, i) => {
                let labels = this.getKeys(source, item.label),
                    row = parseInt(i/this.chartGrid.cols);
                grid.push({
                    left: this.chartGrid.cols > 1 ? ((100/this.chartGrid.cols * (i%this.chartGrid.cols)) + 5) + '%' : '5%',
                    top: this.chartGrid.rows > 1 ? ((100/this.chartGrid.rows * row) + (this.legend && row === 0 ? 5 : 0 ) + 5) + '%' : '50',
                    width: this.chartGrid.cols > 1 ? (100/this.chartGrid.cols - 10) + '%' : '90%',
                    height: this.chartGrid.rows > 1 ? (100/this.chartGrid.rows - 14) + '%' : '70%',
                    containLabel: true
                })
                if (reverse) {
                    xAxis.push({
                        type: 'value',
                        name: item.title,
                        nameLocation: 'middle',
                        nameGap: 30,
                        nameTextStyle: {
                            fontSize: 14,
                            fontWeight: 'bold'
                        },
                        axisTick : {
                            show: false
                        },
                        splitLine: {
                            show: false,
                        },
                        axisLine: {
                            show: true
                        },
                        gridIndex: i,
                    })
                    yAxis.push({
                        type: 'category',
                        gridIndex: i,
                        axisTick : {
                            show: false
                        },
                        splitLine: {
                            show: false,
                        },
                        data: labels,
                    })
                } else {
                    xAxis.push({
                        type: 'category',
                        name: item.title,
                        nameLocation: 'middle',
                        nameGap: 30,
                        nameTextStyle: {
                            fontSize: 14,
                            fontWeight: 'bold'
                        },
                        gridIndex: i,
                        data: labels,
                    })
                    yAxis.push({
                        type: 'value',
                        gridIndex: i,
                        axisTick : {
                            show: false
                        },
                        // splitLine: {
                        //     lineStyle: {
                        //         type: 'dotted'
                        //     }
                        // }
                    })
                }
                legend.data.forEach(t => {
                    let d = {
                        type: 'bar',
                        name: t,
                        xAxisIndex: i,
                        yAxisIndex: i,
                        data: []
                    };
                    if (typeof(dimensions) === 'string') {
                        let list = source.filter(m => m[dimensions] == t);
                        labels.forEach(label => {
                            list.forEach(n => {
                                if (n[item.label] == label) {
                                    d.data.push({
                                        value: n[item.value] || 0,
                                        unit: item.unit,
                                        percent: n[item.percent]
                                    });
                                }
                            })
                        })
                    } else {
                        d.data = source.map(t => {
                            return {
                                value: t[item.value] || 0,
                                unit: item.unit,
                                percent: t[item.percent]
                            }
                        })
                    }
                    series.push(d)
                })
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

