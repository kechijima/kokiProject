<template>
  <v-container>
    <h1>売上分析</h1>
    <v-row>
      <v-col cols="3">
        <v-select
          v-model="selectedYear"
          :items="years"
          label="年を選択"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-select
          v-model="selectedMonth"
          :items="months"
          label="月を選択"
          outlined
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-btn color="primary" @click="fetchData">データ取得</v-btn>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-overline text-h4">
            {{ selectedYear }}年{{ selectedMonth }}月の実績
            <div class="text-green-darken-3 text-h3 font-weight-bold">売上合計 {{ topEarningData.toLocaleString() }}円</div>
            <div class="text-green-darken-3 text-h3 font-weight-bold">経費合計 {{ topExpensesData.toLocaleString() }}円</div>
            <div class="text-green-darken-3 text-h3 font-weight-bold">営業利益 {{ topProfitData.toLocaleString() }}円</div>
          </v-card-title>
          <br>
          <v-card-text>
            <!-- <div
              :style="`right: calc(${review} - 32px)`"
              class="position-absolute mt-n8 text-caption text-green-darken-3"
            >
              目標達成率 {{ review }}
            </div>
            <v-progress-linear
              color="green-darken-3"
              height="22"
              :model-value="result"
              rounded="lg"
            >
              <v-badge
                :style="`right: ${review}`"
                class="position-absolute"
                color="white"
                dot
                inline
              ></v-badge>
            </v-progress-linear> -->
          </v-card-text>

          <v-divider></v-divider>

          <v-list-item
            append-icon="mdi-chevron-right"
            lines="two"
            subtitle="詳細はこちらから"
            link
            @click="changeShowDetails"
          ></v-list-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="showDetails">
      <v-col cols="12">
        <v-data-table
          :headers="aggregateHeaders"
          :items="aggregateData"
          :items-per-page="5"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-if="showGraph">
    <h1>{{ title }}</h1>
    <BarChart :chartData="chartData" :options="chartOptions" />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { analyticsRows } from '@/composables/useSheet';
import { useDayjs } from '#dayjs';
import BarChart from '~/components/BarChart.vue'

const dayjs = useDayjs();
const selectedYear = ref(dayjs().year());
const selectedMonth = ref(dayjs().month() + 1);
const years = ref([...Array(10).keys()].map(i => selectedYear.value - i));
const months = ref([...Array(12).keys()].map(i => i + 1));
const result = ref(0);
const review = ref('');
const topEarningData = ref(0);
const topProfitData = ref(0);
const topExpensesData = ref(0);
const showDetails = ref(false);
const showGraph = ref(false);
const title = ref('半年の売上実績')
const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Data One',
      backgroundColor: '#f87979',
      data: []
    }
  ]
})
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: true
})


const headers = ref([
  { title: '案件', value: '案件' },
  { title: '金額', value: '金額' },
  { title: '計上日', value: '計上日' },
  { title: 'メモ', value: 'メモ' },
  { title: '税抜金額', value: '税抜金額' },
  { title: '消費税額', value: '消費税額' },
  { title: '年月', value: '年月' },
]);

const aggregateHeaders = ref([
  { title: '案件', value: 'category' },
  { title: '目標', value: 'goal' },
  { title: '実績売上', value: 'sales' },
  { title: '経費', value: 'expenses' },
  { title: '利益', value: 'profit' },
  { title: 'GAP', value: 'gap' },
]);

const tableData = ref([]);
const aggregateData = ref([]);

(async () => {
    await fetchData(); // 初期データを取得
})();

onMounted(() => {
  fetchData();
});

// watch([selectedYear, selectedMonth], () => {
//   fetchData();
// });

watch([chartData], () => {
  chartData.value.update();
});

function changeShowDetails() {
  if(showDetails.value) {
    showDetails.value = false;
  } else {
    showDetails.value = true;
  }
}

async function fetchData() {
  try {
    const { earningData: fetchedEarningData, expensesData: fetchedExpensesData } = await analyticsRows();
    const formattedEarningsData = formatData(fetchedEarningData.value.values);
    const formattedExpensesData = formatData(fetchedExpensesData.value.values);

    tableData.value = formattedEarningsData.filter(row => {
      const [year, month] = row['年月'].split('/');
      return parseInt(year) === selectedYear.value && parseInt(month) === selectedMonth.value;
    });

    const filteredExpensesData = formattedExpensesData.filter(row => {
      const [year, month] = row['年月'].split('/');
      return parseInt(year) === selectedYear.value && parseInt(month) === selectedMonth.value;
    });

    aggregateData.value = aggregateDataFormat(tableData.value, filteredExpensesData);
    setChartData(formattedEarningsData, selectedYear.value, selectedMonth.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function formatData(proxyArray) {
  console.log('proxyArray',proxyArray);
  const headers = proxyArray[0];
  const dataArray = [];
  
  for (let i = 1; i < proxyArray.length; i++) {
    const row = proxyArray[i];
    if (row.length > 0) {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      dataArray.push(rowData);
    }
  }
  return dataArray;
}

function aggregateDataFormat(earningsData, expensesData) {
  const data = {};

  earningsData.forEach(row => {
    const category = row['案件'];
    const sales = parseInt(row['金額']) || 0;
    const goal = 1000000; // 目標売上（仮の数値）

    if (!data[category]) {
      data[category] = {
        category: category,
        goal: goal,
        sales: 0,
        expenses: 0,
        profit: 0,
        gap: 0
      };
    }

    data[category].sales += sales;
  });

  expensesData.forEach(row => {
    const category = row['案件'];
    const expenses = parseInt(row['金額']) || 0;

    if (!data[category]) {
      data[category] = {
        category: category,
        goal: 1000000,
        sales: 0,
        expenses: 0,
        profit: 0,
        gap: 0
      };
    }

    data[category].expenses += expenses;
    data[category].profit = data[category].sales - data[category].expenses;
    data[category].gap = data[category].goal - data[category].sales;
  });

  const total = {
    category: 'トータル',
    goal: 0,
    sales: 0,
    expenses: 0,
    profit: 0,
    gap: 0
  };

  Object.values(data).forEach(categoryData => {
    total.goal += categoryData.goal;
    total.sales += categoryData.sales;
    total.expenses += categoryData.expenses;
    total.profit += categoryData.profit;
    total.gap += categoryData.gap;
  });

  result.value = (total.sales / total.goal) * 100;
  topEarningData.value = total.sales;
  topExpensesData.value = total.expenses;
  topProfitData.value = total.profit;

  review.value = `${result.value.toFixed(2)}%`;

  return [...Object.values(data), total];
}

function setChartData(earningsData, selectedYear, selectedMonth) {
  
  showGraph.value = false;
  console.log('earningsData',earningsData);
  console.log('selectedYear',selectedYear);
  console.log('selectedMonth',selectedMonth);
  const labels = [];
  const data = [];
  chartData.value.labels = [];
  chartData.value.datasets[0].data = [];
  let currentDate = dayjs(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`);
  
  for (let i = 0; i < 6; i++) {
    labels.unshift(currentDate.format('YYYY/MM'));
    const monthData = earningsData.find(row => row['年月'] === currentDate.format('YYYY/MM'));
    data.unshift(monthData ? parseInt(monthData['金額']) : 0);
    currentDate = currentDate.subtract(1, 'month');
  }
  showGraph.value = true;
  chartData.value.labels = labels;
  chartData.value.datasets[0].data = data;
}

</script>

<style scoped>
.position-absolute {
  position: absolute;
}
.mt-n8 {
  margin-top: -2rem;
}
.text-green-darken-3 {
  color: #388e3c;
}
.bg-green-darken-3 {
  background-color: #388e3c;
}
</style>
