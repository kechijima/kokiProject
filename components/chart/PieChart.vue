<template>
    <v-layout
      justify-start
      align-start
      wrap
      row
    >
      <v-flex
        align-start
        :lg6="!displayImage"
        :lg4="displayImage"
        sm12
        xs12
      >
        <v-card>
          <div style="width: 100%; text-align: center;" class="my-2 px-1 py-2">
            <span>グラフ名:</span> <input style="width: 80%; border: 1px solid #888" v-model="formData.options.title.text">
          </div>
          <table class="my-1">
            <tr>
              <th style="width: 30%;">項目名</th>
              <th style="width: 30%;">値</th>
              <th style="width: 20%;">色</th>
              <th style="width: 15%;">削除</th>
            </tr>
            <tr v-for="(item, index) in formData.tableDatas" :key="index">
              <td style="text-align: center;"><input style="width:80%; border: 1px solid #888" v-model="item.label"></td>
              <td style="text-align: center;"><input style="width:80%; border: 1px solid #888" v-model="item.value" type="tel"></td>
              <td style="text-align: center;"><input style="width:80%; border: 1px" v-model="item.color" type="color"></td>
              <td style="text-align: center;"><div class="elevation-1" @click="deleteFormData(index)">x</div></td>
            </tr>
          </table>
          <v-btn @click="addDataRow">行を追加する</v-btn>
          <v-btn @click="changeAllColor" class="elevation-1">
            <input style="border: 1px" v-model="globalChartColor" type="color">
            <span >統一</span>
          </v-btn>
          <v-btn @click="randomizeAllColor" class="elevation-1">
            <span>ランダム</span>
          </v-btn>
        </v-card>
        <v-select
          v-model="currentStorageKey"
          :items="localStorageDataList()"
          item-text="name"
          item-value="key"
        ></v-select>
        <v-layout justify-space-between text-xs-center>
          <v-flex xs4><v-btn class="elevation-1" @click="saveChartData()">保存</v-btn></v-flex>
          <v-flex xs4><v-btn class="elevation-1" @click="chartAsImageBase64()">画像表示</v-btn></v-flex>
          <v-flex xs4><v-btn class="elevation-1" @click="deleteCurrentData()">削除</v-btn></v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        :lg6="!displayImage"
        :lg4="displayImage"
        sm12
        xs12
      >
        <pie-chart-canvas :data="buildChartData()" :options="buildChartOptions()"/>
      </v-flex>
      <v-flex
        v-show="displayImage"
        lg4
        sm12
        xs12
      >
        <v-btn @click="displayImage=!displayImage" class="elevation-1">
          <span>画像を非表示にする</span>
        </v-btn>
        <img id="canva-as-image" style="width:100%" src="">
      </v-flex>
    </v-layout>
  </template>
  
  <script>
  import PieChartCanvas from '@/components/chart/PieChartCanvas.vue'
  
  const DEFAULT_LABEL = ''
  const DEFAULT_VALUE = 0
  const DEFAULT_COLOR = '#aaaaaa'
  const DEFAULT_TITLE = 'ここにタイトルが入ります'
  const BAR_CHART_STORAGE_PREFIX = 'PIECHART'
  const STORAGE_TITLE_REGEXP = new RegExp( '^'+ BAR_CHART_STORAGE_PREFIX + '::' + '[0-9a-f]{6}' + '::')
  
  export default {
    components: {
      PieChartCanvas
    },
    data: () => {
      return {
        //フォーム入力データ(グラフ用整形前)
        formData: {
          label: null,
          tableDatas: [
            {
              label: DEFAULT_LABEL,
              value: DEFAULT_VALUE,
              color: DEFAULT_COLOR
            }
          ],
          options: {
            title: {
              display: true,
              text: DEFAULT_TITLE
            },
            scales: {},
            legend: {
              display: true
            }
          }
        },
        //その他
        globalChartColor: DEFAULT_COLOR,
        currentStorageKey: null,
        displayImage: false
      }
    },
    watch: {
      currentStorageKey () {
        if (!this.currentStorageKey || !localStorage.getItem(this.currentStorageKey)) {
          this.formData = this.initFormData()
        } else {
          this.formData = JSON.parse(localStorage.getItem(this.currentStorageKey))
        }
      }
    },
    computed: {
    },
    methods: {
      chartAsImageBase64 () {
        if (!document.getElementById('pie-chart') || !document.getElementById('canva-as-image')) return
        this.displayImage = true
        document.getElementById('canva-as-image').src
          = document.getElementById('pie-chart').toDataURL('image/png')
      },
      saveChartData() {
        if(this.currentStorageKey && this.currentStorageKey !== 'null') {
          if(this.currentStorageKey.replace(STORAGE_TITLE_REGEXP,'') === this.formData.options.title.text) {
            localStorage.setItem(this.currentStorageKey, JSON.stringify(this.formData))
          } else {
            const new_key = this.currentStorageKey.match(STORAGE_TITLE_REGEXP)[0] + this.formData.options.title.text
            const old_key = this.currentStorageKey
            localStorage.setItem(new_key, JSON.stringify(this.formData))
            this.currentStorageKey = new_key
            localStorage.removeItem(old_key)
          }
        } else {
          const storageKey = `${BAR_CHART_STORAGE_PREFIX}::${this.generateRandomHash()}::${this.formData.options.title.text}`
          localStorage.setItem(storageKey, JSON.stringify(this.formData))
          this.currentStorageKey = storageKey
        }
      },
      deleteCurrentData () {
        const new_key = null
        const old_key = this.currentStorageKey
        this.formData = this.initFormData()
        localStorage.removeItem(old_key)
        this.currentStorageKey = null
      },
      buildChartData () {
        return {
          labels: this.formData.tableDatas.map(a => a.label),
          datasets: [{
            data: this.formData.tableDatas.map(a => a.value),
            backgroundColor: this.formData.tableDatas.map(a => a.color)
          }]
        }
      },
      buildChartOptions () {
        return this.formData.options
      },
      addDataRow () {
        this.formData.tableDatas.push({
          label: DEFAULT_LABEL,
          value: DEFAULT_VALUE,
          color: this.generateRandomColor()
        })
      },
      generateRandomColor () {
        return `#${this.generateRandomHash()}`
      },
      generateRandomHash () {
        return ("000000" + (Math.random() * 0xFFFFFF | 0).toString(16)).slice(-6)
      },
      deleteFormData (id) {
        var count = 0
        const tempDatas = []
        this.formData.tableDatas.forEach(oneTableData => {
          if (count !== id) tempDatas.push(oneTableData)
          count ++
        })
        this.formData.tableDatas = tempDatas
      },
      changeAllColor () {
        if  (!this.globalChartColor) return
        this.formData.tableDatas.forEach(oneTableData => {
          oneTableData.color = this.globalChartColor
        })
      },
      randomizeAllColor () {
        this.formData.tableDatas.forEach(oneTableData => {
          oneTableData.color = this.generateRandomColor()
        })
      },
      localStorageDataList () {
        var keys = [{key: null, name: '保存したデータを選んで下さい'}]
        for (var key in localStorage) {
          if (key.match(STORAGE_TITLE_REGEXP)) keys.push({key: key, name: key.replace(STORAGE_TITLE_REGEXP,'')})
        }
        return keys
      },
      initFormData () {
        return {
          label: null,
          tableDatas: [
            {
              label: DEFAULT_LABEL,
              value: DEFAULT_VALUE,
              color: DEFAULT_COLOR
            }
          ],
          options: {
            title: {
              display: true,
              text: DEFAULT_TITLE
            },
            scales: {},
            legend: {
              display: true
            }
          }
        }
      }
    }
  }
  </script>
  <style scoped>
  </style>