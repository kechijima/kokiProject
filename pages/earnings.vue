<script setup>
import { getEarnKamokuRows } from '@/composables/useSheet';
import { useDayjs } from '#dayjs' 
import { ref, onMounted } from 'vue';

const dayjs = useDayjs();
const valid = ref(true);
const projectName = ref(null);
const amountRules = [
    v => !!v || '金額は必須です',
    v => !isNaN(v) || '金額は数字で入力してください'
];
const amount = ref(null);
const kamoku = ref(null);
const date = ref(null);
const comment = ref();
const projectIems = ref([]);
const result = ref([]);

(async () => {
    await fetchData(); // 初期データを取得
})();

onMounted(async () => {
    await fetchData();
    initializeLiff('2005378903-GN6DwMrN');
});

async function fetchData() {
    try {
        const { data, error } = await getEarnKamokuRows();
        if (data.value.values) {
            projectIems.value = data.value.values.map(item => item[0]);
            console.log(projectIems.value);
        } else {
            console.error('Failed to load kamoku data');
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function submitForm() {
    const message = `earnings\n${projectName.value}\n${amount.value}\n${dayjs(date.value).format('YYYY/MM/DD')}\n${comment.value}`;
    sendMessages(message);
}

function initializeApp(){
    liff.getProfile().then(profile => {
        console.log('User profile:', profile);
    }).catch((err) => {
        console.log('Failed to get profile', err);
    });

}

function initializeLiff(liffId) {
    const liffSDKUrl = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    const script = document.createElement('script');
    script.src = liffSDKUrl;
    script.onload = () => {
        liff.init({ liffId: liffId })
        .then(() => {
            initializeApp();
        })
        .catch((err) => {
            console.log('LIFF Initialization failed ', err);
        });
    };
    document.body.appendChild(script);
}

function sendMessages(message) {
    liff.sendMessages([{
        type: 'text',
        text: message
    }]).then(function() {
        liff.closeWindow();
    }).catch(function(error) {
        console.error(error);
    });
}
</script>

<template>
  <v-form ref="form" v-model="valid" lazy-validation class="mt-6 ml-6" style="width: 50%;">
    <h2 class="my-6">売上入力</h2>
    <v-select v-model="projectName" label="案件" :items="projectIems" required></v-select>
    <v-text-field v-model="amount" label="金額"  prefix="￥" :rules="amountRules" @input="formatAmount"></v-text-field>
    <v-text-field v-model="date" label="日付" type="date"></v-text-field>
    <v-text-field v-model="comment" label="メモ"></v-text-field>
    <v-btn color="primary" @click="submitForm">送信</v-btn>
  </v-form>
</template>
