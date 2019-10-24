<template>
    <div>
        <!-- 图例 -->
        <dt-bar :data="chartData" :grid="{ cols: 3 }" height="300px" />
        <dt-line :data="lineData" :grid="{ cols: 1 }" height="300px" />
        <dt-pie :data="pieData" :grid="{ cols: 1 }" :config="chartConfig" height="300px" />
        <dt-map :data="mapData" :grid="{ cols: 1 }" :go-down="true" height="400px" />
        <!-- 表格 -->
        <NormalTable :loading="tableLoading" :data="chartData.source" :border="true" span-row-key="channel" :pagination="false" max-height="600px" @search="getList">
            <!-- 渠道 -->
            <el-table-column prop="channel" label="渠道" min-width="100" />
            <!-- 性别 -->
            <el-table-column prop="sex" label="性别" min-width="100" />
            <!-- 付款人数 -->
            <el-table-column prop="pay_count" label="付款人数" min-width="100" />
            <!-- 付款金额 -->
            <el-table-column prop="pay_money" label="付款金额" min-width="100" />
            <!-- 占比 -->
            <el-table-column prop="" label="占比" min-width="120">
                <template slot-scope="scope">
                    <span>付款人数占比：{{ scope.row.pay_count_prop }}%</span><br>
                    <span>付款金额占比：{{ scope.row.pay_money_prop }}%</span>
                </template>
            </el-table-column>
        </NormalTable>
    </div>
</template>

<script>
import { DtBar, DtMap, DtLine, DtPie } from '@/components/charts';
import NormalTable from '@/components/NormalTable';

export default {
    components: {
        DtBar,
        DtMap,
        DtLine,
        DtPie,
        NormalTable
    },
    data() {
        return {
            searchAttrs: {
                view_type: '',
                start_date: ''
            },
            dimensions: {
                channel: '渠道',
                sex: '性别',
                pay_count: '付款人数',
                pay_money: '付款金额',
                pay_count_prop: '付款人数占比',
                pay_money_prop: '付款金额占比',
            },
            chartData: {
                dimensions: 'channel',
                tips: function (data) {
                    let res = `${data[0].name}<br />`;
                    data.forEach(t => {
                        res += t.marker;
                        res += `${t.seriesName}：${t.data.value}${t.data.unit}`;
                        res += `${t.data.percent &&  ('，占比' + t.data.percent + '%')}<br />`;
                    })
                    return res;
                },
                gridData: [
                    { label: 'sex', value: 'pay_count', unit: '人', percent: 'pay_count_prop', title: '性别人数分布' },
                    { label: 'sex', value: 'pay_money', unit: '元', percent: 'pay_money_prop', title: '性别消费金额分布' },
                    { label: 'sex', value: 'pay_money', unit: '元', percent: 'pay_money_prop', title: '性别人均付款金额' },
                ],
                source: [
                    { channel: '天猫', sex: '男', pay_count: '98', pay_money: '965.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                    { channel: '天猫', sex: '女', pay_count: '198', pay_money: '865.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                    { channel: '京东', sex: '男', pay_count: '68', pay_money: '665.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                    { channel: '京东', sex: '女', pay_count: '38', pay_money: '165.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                    { channel: '有赞', sex: '男', pay_count: '58', pay_money: '765.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                    { channel: '有赞', sex: '女', pay_count: '18', pay_money: '965.1', pay_count_prop: '49', pay_money_prop: '61.2' },
                ]
            },
            lineData: {
                title: '',
                tips: function (data) {
                    let res = `${data[0].name}<br />`;
                    data.forEach(t => {
                        res += t.marker;
                        res += `${t.seriesName}：${t.value}人<br/>`;
                    })
                    return res;
                },
                dimensions: [
                    { name: '下单', key: 'order_customer_count' },
                    { name: '付款', key: 'pay_customer_count' },
                ],
                gridData: [
                    { label: 'date', unit: '人', title: '消费趋势分析' },
                ],
                source: [
                    { date: '2019-01-01', order_customer_count: 3, pay_customer_count: 6 },
                    { date: '2019-01-02', order_customer_count: 2, pay_customer_count: 16 },
                    { date: '2019-01-03', order_customer_count: 3, pay_customer_count: 26 },
                    { date: '2019-01-04', order_customer_count: 4, pay_customer_count: 16 },
                    { date: '2019-01-05', order_customer_count: 8, pay_customer_count: 26 },
                    { date: '2019-01-06', order_customer_count: 11, pay_customer_count: 16 },
                    { date: '2019-01-07', order_customer_count: 2, pay_customer_count: 16 },
                ]
            },
            pieData: {
                title: '商品分析',
                dimensions: '',
                formatter: '{v|{c}}\n{n|{b}}\n{n|占比{d}%}',
                rich: {
                    v: {
                        fontSize: 20,
                        color: '#27282A',
                        padding: [5, 0, 0, 0],
                    },
                    n: {
                        fontSize: 14,
                        color: '#737373'
                    },
                },
                gridData: [
                    { label: 'attr_name', value: 'pay_money' },
                    // { label: 'attr_name', value: 'pay_count' },
                ],
                source: [
                    { attr_name: '商品一', pay_money: '161.0', pay_count: 3 },
                    { attr_name: '商品二', pay_money: '286.0', pay_count: 3 },
                    { attr_name: '商品三', pay_money: '361.0', pay_count: 4 },
                ]
            },
            chartConfig: {
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    y: 'middle',
                }
            },
            mapData: {
                gridData: [
                    { mapName: 'china' },
                ],
                source: [
                    {name:"北京",value:199},
                    {name:"天津",value:42},
                    {name:"河北",value:102},
                    {name:"山西",value:81},
                    {name:"内蒙古",value:47},
                    {name:"辽宁",value:67},
                    {name:"吉林",value:82},
                    {name:"黑龙江",value:123},
                    {name:"上海",value:24},
                    {name:"江苏",value:92},
                    {name:"浙江",value:114},
                    {name:"安徽",value:109},
                    {name:"福建",value:116},
                    {name:"江西",value:91},
                    {name:"山东",value:119},
                    {name:"河南",value:137},
                    {name:"湖北",value:116},
                    {name:"湖南",value:114},
                    {name:"重庆",value:91},
                    {name:"四川",value:125},
                    {name:"贵州",value:62},
                    {name:"云南",value:83},
                    {name:"西藏",value:9},
                    {name:"陕西",value:80},
                    {name:"甘肃",value:56},
                    {name:"青海",value:10},
                    {name:"宁夏",value:18},
                    {name:"新疆",value:180},
                    {name:"广东",value:123},
                    {name:"广西",value:59},
                    {name:"海南",value:14},
                ]
            },
            tableLoading: false,
            tableData: []
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {

        }
    }
}
</script>

