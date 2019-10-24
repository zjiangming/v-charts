<template>
    <div class="dtm-normalTable">
        <!-- 表格 -->
        <el-table
            :ref="tableName"
            :key="tableKey"
            v-loading="loading"
            class="dtm-normalTable__table"
            :class="{ single: select.type === 'single' }"
            :data="list"
            :highlight-current-row="select.type === 'single'"
            :span-method="arraySpanMethod"
            :row-class-name="rowClassNameFunc"
            :row-style="rowStyle"
            :border="border"
            :max-height="maxHeight"
            :row-key="getRowKeys"
            :tooltip-effect="tooltipEffect"
            :show-header="showHeader"
            @current-change="val => tableCurrentChange(val)"
            @select="selectChange"
            @select-all="selectAll"
            @sort-change="sortChange"
            @row-dblclick="rowDblclick"
        >
            <!-- 多选 -->
            <el-table-column
                v-if="select.type === 'multiple'"
                type="selection"
                class-name="dtm-normalTable__table-select"
                :reserve-selection="true"
                :selectable="selectable"
                min-width="50"
            />
            <!-- 内容 -->
            <slot />
        </el-table>
        <!-- 分页 -->
        <div v-if="pagination" class="dtm-normalTable__pagination">
            <el-pagination
                :page-sizes="paginationSetting.pageSizes || [10, 20, 30, 40]"
                :page-size="data.page_size || 10"
                :total="data.total"
                :current-page="data.page_no"
                :layout="paginationSetting.layout || 'sizes, prev, pager, next, jumper'"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'NormalTable',
    props: {
        tableName: {
            type: String,
            default: 'normalTable'
        },
        tableKey: {
            type: String,
            default: 'normalTableKey'
        },
        data: {
            type: [Object, Array],
            default: () => ({
                list: [],
                page_no: 1,
                page_size: 10,
                total: 0
            })
        },
        pagination: { type: Boolean, default: true },
        paginationSetting: {
            type: Object,
            default: () => ({})
        },
        // 当为可选表格时必须传入type, rowKeyName
        select: {
            type: Object,
            default: () => ({ type: false })
        },
        // 多选时最多可选个数
        maxSelect: {
            type: [Boolean, Number],
            default: true
        },
        // 一行数据组合显示
        assemble: {
            type: Array,
            default: () => []
            /*
                例：分成3行，第一行只有1列，第二行有5列，第三行有2列
                [
                    [[1, 5]],
                    [],
                    [[1, 4], [1, 1]]
                ]
                其中[1, 5]，1为行数，5为列数
            */
        },
        // 原生属性
        loading: { type: Boolean, default: false },
        rowClassName: { type: Function, default: ({ row }) => `dtm-row${row._index ? row._index : ''}` },
        defaultSort: { type: Object, default: () => ({}) },
        border: { type: Boolean, default: false },
        tooltipEffect: { type: String, default: 'dark'},
        maxHeight: { type: [Number, String], default: null },
        rowDblclick: { type: Function, default: () => {} },
        rowStyle: {
            type: [Function, Object],
            default: () => ({})
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        spanRowKey: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            list: [],
            current: [],
            defaultSelected: [],
            getRowKeys: row => row[this.select.rowKeyName],
            spanRow: {
                keys: {},
                span: []
            }
        };
    },
    watch: {
        data: {
            handler: function(data) {
                this.init();
            },
            deep: true
        }
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            const { assemble, data } = this;
            // 判断是否多行数据一行显示
            if (Array.isArray(data)) {
                this.list = data;
            } else if (assemble.length > 1) {
                const newList = [];
                Array.from(data.list, (i, iIndex) => {
                    newList.push(
                        ...new Array(assemble.length).fill(1).map((y, yIndex) => ({ ...i, _index: yIndex, _rowIndex: iIndex }))
                    );
                });
                this.list = newList;
            } else {
                this.list = data.list;
            }
            // 合并行处理
            if (this.spanRowKey) {
                let { keys, span } = this.spanRow,
                    row = null,
                    current = '';
                this.list.forEach(item => {
                    keys[item[this.spanRowKey]] = true;
                })
                this.list.forEach((item, index) => {
                    if (item[this.spanRowKey] != current) {
                        current = item[this.spanRowKey];
                        row = [1, 1];
                        span.push(row);
                    } else {
                        row[0] += 1;
                        span.push([0, 0])
                    }
                })
            }
        },
        // 处理组合模式合并
        arraySpanMethod({ row, column, rowIndex, columnIndex }) {
            const { _index } = row;
            const { assemble } = this;
            const { span } = this.spanRow;
            // 行合并
            if (this.spanRowKey && columnIndex === 0) {
                return span[rowIndex];
            }
            // 列合并
            if (assemble.length > 0) {
                return assemble[_index].length === 0 ? [1, 1] : assemble[_index][columnIndex] || [0, 0];
            } else {
                return [1, 1];
            }
        },
        // 行样式处理
        rowClassNameFunc({row, rowIndex}) {
            let className = this.rowClassName(...arguments);
            // 单选表格会根据已选项添加选中样式类名
            if (this.select.type === 'single' && this.current.length > 0 && this.current[0]) {
                if (this.current[0][this.select.rowKeyName] === row[this.select.rowKeyName]) {
                    className += ' current-row';
                }
            }
            return className;
        },
        // 返回当前选中状态
        tableCurrent() {
            return this.current;
        },
        // 多选表格设置默认选中值
        setDefaultSelected(curData, boolean = true) {
            this.current = curData;
            this.defaultSelected = curData;
            this.$nextTick(() => {
                const id = this.select.rowKeyName;
                this.defaultSelected.forEach(curDataItem => {
                    this.list.forEach(item => {
                        if (curDataItem[id] === item[id]) {
                            this.$refs[this.tableName].toggleRowSelection(item, boolean);
                        }
                    });
                });
            });
        },
        // 单个数据是否选中
        toggleRowSelection(row, boolean) {
            this.$refs[this.tableName].toggleRowSelection(row, boolean);
        },
        // 多选表格设置最多选中个数
        selectable(row) {
            const { maxSelect, current, select: { rowKeyName } } = this;
            if (typeof maxSelect === 'boolean') return maxSelect;
            if (current.length >= maxSelect) {
                return current.findIndex(item => item[rowKeyName] === row[rowKeyName]) !== -1;
            } else {
                return true;
            }
        },
        // 选择项发生变化回调 - 用于单选
        tableCurrentChange(val) {
            if (this.select.type === 'single') {
                this.current = [val];
                this.$emit('selectChange', this.current);
            }
        },
        // 手动勾选CheckBox回调 - 用于多选
        selectChange(selection, row) {
            const id = this.select.rowKeyName;
            const res = selection.filter(item => item[id] === row[id]).length > 0;

            if (this.defaultSelected.length > 0) {
                if (res) {
                    // 选中
                    this.defaultSelected.push(row);
                } else {
                    // 取消选中
                    this.defaultSelected = this.defaultSelected.filter(item => item[id] !== row[id]);
                }
                this.current = this.defaultSelected;
            } else {
                this.current = selection;
            }
            this.$emit('selectChange', this.current);
        },
        // 点击全选按钮回调 - 用于多选
        selectAll(selection) {
            const id = this.select.rowKeyName;
            const res = this.list.filter(list => selection.filter(select => select[id] === list[id]).length > 0).length === 5;

            if (this.defaultSelected.length > 0) {
                const defaultObj = {};
                this.defaultSelected.forEach(item => { defaultObj[item[id]] = item; });

                if (res) {
                    // 全选
                    selection.forEach(item => { defaultObj[item[id]] = item; });
                    this.defaultSelected = Object.keys(defaultObj).map(i => defaultObj[i]);
                } else {
                    // 全不选
                    this.list.forEach(item => {
                        delete defaultObj[item[id]];
                    });
                    this.defaultSelected = Object.keys(defaultObj).map(i => defaultObj[i]);
                }
                this.current = this.defaultSelected;
            } else {
                this.current = selection;
            }
            this.$emit('selectChange', this.current);
        },
        clearTableCurrent() {
            switch(this.select.type) {
                case 'multiple':
                    this.$refs[this.tableName].clearSelection();
                    break;
                case 'single':
                    this.$refs[this.tableName].setCurrentRow();
                    break;
            }
        },
        handleCurrentChange(page_no) {
            this.$emit('search', { page_no });
        },
        handleSizeChange(page_size) {
            this.$emit('search', { page_no: 1, page_size });
        },
        sortChange(prop) {
            this.$emit('sortChange', prop);
        }
    }
}
</script>

<style lang="scss">
.dtm-normalTable {
    width: 99.9%; // 解决element-ui table抖动bug
    .dtm-normalTable__table {
        font-size: 12px;
        line-height: 23px;
        &:not(.el-table--border) {
            border-top: 1px solid #DEDEDE;
            border-right: 1px solid #DEDEDE;
            border-left: 1px solid #DEDEDE;
        }
        // 单选
        @mixin currentRow {
            &:after {
                content: "\e677";
                position: absolute;
                margin: 28px 0 0 -17px;
                font-size: 18px;
                color: #495BD2;
            }
            &>td {
                background: #E3ECFB;
            }
        }
        &.single {
            cursor: pointer;
            .current-row {
                @include currentRow;
            }
        }
        // 自定义单行选中
        .custom-current-row {
            @include currentRow;
        }
        // 多选
        .dtm-normalTable__table-select {
            >.cell {
                height: 23px;
            }
        }
        // 行内分行
        $height: 80px;
        *[inside-row] {
            margin: 0 -10px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            width: calc(100% + 20px);
            height: $height;
            +*[inside-row] {
                margin-top: 12px;
                padding-top: 12px;
                height: calc(#{$height} + 12px);
                border-top: 1px solid #DEDEDE;
            }
        }
        .el-tag {
            max-width: 100%;
        }
    }
    .dtm-normalTable__pagination {
        margin-top: 16px;
        text-align: right;

        .el-pagination {
            padding-right: 0;
            &__jump {
                margin-left: 12px;
                font-size: 14px;
                .el-input__inner {
                    border-radius: 2px;
                }
            }
            &__editor {
                margin: 0 6px;
            }
        }
    }
    .el-loading-mask {
        bottom: 1px;
    }
    // 去掉带边框表格的表头边框
    .el-table--border th {
        border-right: none;
    }
}
</style>
