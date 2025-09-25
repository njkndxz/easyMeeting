<template>
    <div :style="{ 'height': `calc(100vh - ${otherHeight}px)` }">
        <el-table ref="dataTable" :data="dataSource.list || []" height="100%" :stripe="options.stripe"
            :border="options.border" header-row-class-name="table-header-row" highlight-current-row
            @row-click="handleRowClick" @selection-change="handleSelectionChange">
            <!--selection选择柜-->
            <el-table-column v-if="options.selectType && options.selectType == 'checkbox'" type="selection"
                :selectedHandler="selectedHandler" width="50" align="center">
            </el-table-column>
            <!--序号-->
            <el-table-column v-if="options.showIndex" label="序号" type="index" width="60"
                align="center"></el-table-column>
            <!--数据列-->
            <template v-for="(column, index) in columns">
                <template v-if="column.scopedSlots">
                    <el-table-column :key="index" :prop="column.prop" :label="column.label"
                        :align="column.align || 'left'" :width="column.width">
                        <template #default="scope">
                            <slot :name="column.scopedSlots" :index="scope.$index" :row="scope.row"></slot>
                        </template>
                    </el-table-column>
                </template>
                <template v-else>
                    <el-table-column :key="index" :prop="column.prop" :label="column.label"
                        :align="column.align || 'left'" :width="column.width" :fixed="column.fixed">
                    </el-table-column>
                </template>
            </template>
        </el-table>
        <!--分页-->
        <div class="pagination" v-if="showPagination">
            <el-pagination v-if="dataSource.totalCount" background :total="dataSource.totalCount"
                :page-sizes="[15, 30, 50, 100]" :page-size="dataSource.pageSize" :current-page.sync="dataSource.pageNo"
                layout="total, sizes, prev, pager, next, jumper" @size-change="handlePageSizeChange"
                @current-change="handlePageNoChange" style="text-align: right"></el-pagination>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const emit = defineEmits(['rowSelected', 'rowClick'])
const props = defineProps({
    dataSource: Object,
    showPagination: {
        type: Boolean,
        default: true
    },
    options: {
        type: Object,
        default: {}
    },
    extHeight: {
        default: 32
    },
    columns: Array,
    fetch: Function,
    initFetch: {
        type: Boolean,
        default: true
    },
    selected: Function
})

// 标题栏 42分页内容 容器padding 10*2 + header 30
const otherHeight = computed(() => {
    return props.extHeight + 42 + 20 + 32
})

// 初始化
const init = () => {
    if(props.initFetch && props.fetch) {
        props.fetch()
    }
}
init()

const dataTable = ref()
// 清除选中
const clearSelection = () => {
    dataTable.value.clearSelection()
}

// 设置行选中
const setCurrentRow = (rowKey, rowValue) => {
    let row = props.dataSource.list.find((item) => {
        return item[rowKey] === rowValue
    })

    dataSource.value.setCurrentRow(row)
}

const handleRowClick = (row) => {
    emit('rowClick', row)
}

const handleSelectionChange = (row) => {
    emit('rowSelected', row)
}

const handlePageSizeChange = (size) => {
    props.dataSource.pageSize = size
    props.dataSource.pageNo = 1
    props.fetch()
}

const handlePageNoChange = (pageNo) => {
    props.dataSource.pageNo = pageNo
    props.fetch()
}

const selectedHandler = (row, index) => {
    if(props.selected) {
        return props.selected(row, index)
    }
}

defineExpose({
    setCurrentRow, 
    clearSelection
})

</script>

<style lang="scss" scoped>
.pagination {
    padding-top: 10px;
}
.el-pagination {
    justify-content: right;
}

.el-table__body tr.current-row > td.el-table__cell {
    background-color: #e6f0f9;
}

.el-table__body tr:hover > td.el-table__cell {
    background-color: #e6f0f9 !important;
}
</style>