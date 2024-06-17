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
              <th colspan="2" style="width: 40%;">削除</th>
            </tr>
            <tr v-for="(item, index) in formData.tableDatas" :key="index">
              <td style="text-align: center;"><input style="width:80%; border: 1px solid #888" v-model="item.label"></td>
              <td style="text-align: center;"><input style="width:80%; border: 1px solid #888" v-model="item.value" type="tel"></td>
              <td colspan="2" style="text-align: center;"><div class="elevation-1 px-3" style="text-align: center; display: inline-block" @click="deleteFormData(index)">x</div></td>
            </tr>
          </table>
          <table class="my-1">
            <tr>
              <td style="width:25%">上限</td>
              <td style="width:25%"><input style="width:100%; border: 1px solid #888" v-model="formData.options.scales.yAxes[0].ticks.suggestedMax"></td>
              <td style="width:25%"><span>下限</span></td>
              <td style="width:25%"><input style="width:100%; border: 1px solid #888" v-model="formData.options.scales.yAxes[0].ticks.suggestedMin"></td>
            </tr>
            <tr>
              <td style="width:25%">縦ラベル</td>
              <td style="width:25%"><input style="width:100%; border: 1px solid #888" v-model="formData.options.scales.yAxes[0].scaleLabel.labelString"></td>
              <td style="width:25%"><span>横ラベル</span></td>
              <td style="width:25%"><input style="width:100%; border: 1px solid #888" v-model="formData.options.scales.xAxes[0].scaleLabel.labelString"></td>
            </tr>
          </table>
          <v-btn small @click="addDataRow">行を追加する</v-btn>
          <v-dialog width="300">
            <template v-slot:activator="{ on }">
              <v-btn small>
                <span v-on="on" :style="{ background: `${bulidColor()}`}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span v-on="on">色選択</span>
              </v-btn>
            </template>
            <color-palet v-model="formData.globalChartbackgroundColor" />
          </v-dialog>
          <v-btn small @click="changeAllColor" class="elevation-1" style="display: inline-block;">
            <span >色変更</span>
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
        <line-chart-canvas :data="buildChartData()" :options="buildChartOptions()"/>
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
  import LineChartCanvas from '@/components/chart/LineChartCanvas.vue'
  import ColorPalet from '@/components/ColorPalet.vue'
  const DEFAULT_LABEL = ''
  const DEFAULT_VALUE = 0
  const DEFAULT_COLOR = 'rgba(0, 10, 100, 0.8)'
  const DEFAULT_TITLE = 'ここにタイトルが入ります'
  const LINE_CHART_STORAGE_PREFIX = 'LINECHART'
  const STORAGE_TITLE_REGEXP = new RegExp( '^'+ LINE_CHART_STORAGE_PREFIX + '::' + '[0-9a-f]{6}' + '::')
  
  export default {
    components: {
      LineChartCanvas, ColorPalet
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
              backgroundColor: DEFAULT_COLOR,
              borderColor: DEFAULT_COLOR,
              fill: false
            }
          ],
          options: {
            elements: {
              line: {
                tension: 0
              }
            },
            title: {
              display: true,
              text: DEFAULT_TITLE
            },
            scales: {
              yAxes: [{
                ticks: {
                  suggestedMax: 100,
                  suggestedMin: 0
                },
                scaleLabel: {
                  display: true,
                  labelString: '縦軸ラベル'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: '横軸ラベル'
                }
              }]
            },
            legend: {
              display: false
            }
          },
          globalChartbackgroundColor: {
            blue: 0,
            red: 0,
            green: 0,
            opacity: 0.8
          }
        },
        //その他
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
        if (!document.getElementById('line-chart') || !document.getElementById('canva-as-image')) return
        this.displayImage = true
        document.getElementById('canva-as-image').src
          = document.getElementById('line-chart').toDataURL('image/png')
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
          const storageKey = `${LINE_CHART_STORAGE_PREFIX}::${this.generateRandomHash()}::${this.formData.options.title.text}`
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
            backgroundColor: this.formData.tableDatas.map(a => a.backgroundColor),
            borderColor:  this.formData.tableDatas.map(a => a.borderColor),
            fill: this.formData.tableDatas.map(a => a.fill),
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
          backgroundColor: DEFAULT_COLOR,
          borderColor: DEFAULT_COLOR,
          fill: false
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
        if  (!this.formData.globalChartbackgroundColor) return
        const color = this.bulidColor()
        this.formData.tableDatas.forEach(oneTableData => {
          oneTableData.backgroundColor = color
          oneTableData.borderColor = color
        })
      },
      localStorageDataList () {
        var keys = [{key: null, name: '保存したデータを選んで下さい'}]
        for (var key in localStorage) {
          if (key.match(STORAGE_TITLE_REGEXP)) keys.push({key: key, name: key.replace(STORAGE_TITLE_REGEXP,'')})
        }
        return keys
      },
      bulidColor () {
        if (!this.formData.globalChartbackgroundColor) return DEFAULT_COLOR
        return `rgba(${this.formData.globalChartbackgroundColor.red}, ${this.formData.globalChartbackgroundColor.green}, ${this.formData.globalChartbackgroundColor.blue}, ${this.formData.globalChartbackgroundColor.opacity})`
      },
      initFormData () {
        return {
          label: null,
          tableDatas: [
            {
              label: DEFAULT_LABEL,
              value: DEFAULT_VALUE,
              backgroundColor: DEFAULT_COLOR,
              borderColor: DEFAULT_COLOR,
              fill: false
            }
          ],
          options: {
            elements: {
              line: {
                tension: 0
              }
            },
            title: {
              display: true,
              text: DEFAULT_TITLE
            },
            scales: {
              yAxes: [{
                ticks: {
                  suggestedMax: 100,
                  suggestedMin: 0
                },
                scaleLabel: {
                  display: true,
                  labelString: '縦軸ラベル'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: '横軸ラベル'
                }
              }]
            },
            legend: {
              display: false
            }
          },
          globalChartbackgroundColor: {
            blue: 0,
            red: 0,
            green: 0,
            opacity: 0.8
          }
        }
      }
    }
  }
  </script>
  <style scoped>
  </style>