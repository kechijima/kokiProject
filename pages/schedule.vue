<script setup>
import { useDayjs } from '#dayjs' 
import { ref, onMounted } from 'vue';

const dayjs = useDayjs();
const valid = ref(true);
const title = ref(null);
const startTime = ref(null);
const endTime = ref(null);
const place = ref(null);

onMounted(async () => {
    const now = dayjs();
    startTime.value = now.format('YYYY-MM-DD HH:mm');
    endTime.value = now.add(1, 'hour').format('YYYY-MM-DD HH:mm');
    initializeLiff('2005378903-PJ6JRY8e');
});


// 開始時間が変更されたときに終了時間を更新する
watch(startTime, (newStartTime) => {
    if (newStartTime) {
        endTime.value = dayjs(newStartTime).add(1, 'hour').format('YYYY-MM-DD HH:mm');
    }
});

function submitForm() {
    const message = `schedule\n${title.value}\n${startTime.value}\n${endTime.value}\n${place.value}`;
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
    <h2 class="my-6">カレンダー入力</h2>
    <v-text-field v-model="title" label="タイトル" required></v-text-field>
    <v-text-field v-model="startTime" label="開始時間" type="datetime-local" step="900"></v-text-field>
    <v-text-field v-model="endTime" label="終了時間" type="datetime-local" step="900"></v-text-field>
    <v-text-field v-model="place" label="場所" prepend-inner-icon="mdi-map-marker"></v-text-field>
    <v-btn color="primary" @click="submitForm">送信</v-btn>
  </v-form>
</template>
