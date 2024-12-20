<template>
    <v-container>
      <!-- 事業詳細のセレクトボックス -->
      <v-form ref="form" v-model="valid" lazy-validation class="mt-6 mr-6" style="width: 80%;">
        <h2 class="my-6">売上入力</h2>
        <v-select v-model="selectedDetail" :items="details" label="事業詳細を選択" @update:modelValue="updateType" required></v-select>
        <v-select v-model="kessaiType" :items="kessaiTypes" label="決済方法" required></v-select>
        <v-select v-model="keihiKamoku" :items="kamokuDatas" label="経費科目" required></v-select>
        <v-text-field label="支払日" v-model="keihiDate" input type="date"></v-text-field>
        <v-text-field label="支払金額" v-model="keihiAmount" :rules="amountRules" prefix="￥" required></v-text-field>
        <v-text-field label="備考" v-model="memo" required></v-text-field>
        <v-btn color="primary" @click="submitForm">送信</v-btn>
    </v-form>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted,watch } from "vue";
  import { getProjectData } from "~/composables/useSheet";
  import { getKamokuRows } from "~/composables/useSheet";
  import { useDayjs } from '#dayjs' 
  
  const dayjs = useDayjs();
  const projectData = ref({});
  const details = ref([]);
  const selectedDetail = ref(null);
  const selectedType = ref(null);
  const kessaiType = ref(null);
  const kessaiTypes = ref(['現金','カード','銀行振込']);
  const keihiDate = ref(null);
  const keihiKamoku = ref(null); // 経費科目
  const kamokuDatas = ref([]); // 経費科目データ
  const keihiAmount = ref(null);
  const amountRules = [
    v => !!v || '金額は必須です',
    v => !isNaN(v) || '金額は数字で入力してください'
  ];
  const memo = ref(null);

  onMounted(async () => {
    initializeLiff('2005378903-Q3Erbe04');
    try {
      const data = await getProjectData();
      projectData.value = data;
  
      // 事業詳細の一覧を取得
      details.value = Object.keys(data);//Object.values(data).flat();
      console.log(details.value);
    } catch (error) {
      console.error("データ取得エラー:", error);
    }

    try{
      const kamokuData = await getKamokuRows();
      console.log(kamokuData.data.value.values.map(item => item[0]));
      kamokuDatas.value = kamokuData.data.value.values.map(item => item[0]);
    }catch(error){
      console.error("経費科目データ取得エラー:", error);
    }
    
    // 初期の請求日を基に関連フィールドを計算
    keihiDate.value = dayjs().format('YYYY-MM-DD');    
  });

  // 事業詳細の選択変更を監視
  watch(selectedDetail, (newDetail) => {
    console.log("選択された事業詳細:", newDetail);

    // 選択された事業詳細に基づいて事業タイプを更新
    for (const [type, detailList] of Object.entries(projectData.value)) {
      //if (detailList.includes(newDetail)) {
      if (newDetail && projectData.value[newDetail]) {
        const detailData = projectData.value[newDetail];
        selectedType.value = detailData.type; // 事業タイプ
        return;
      }
    }
    // 該当する事業詳細がない場合
    selectedType.value = null;
    console.log("該当する事業タイプが見つかりません");
  });

  // フォーム送信
  const submitForm = () => {
      const message = `expenses|${selectedType.value}|${selectedDetail.value}|${kessaiType.value}|${keihiKamoku.value}|${keihiAmount.value}|${dayjs(keihiDate.value).format('YYYY/MM/DD')}|${memo.value}`;
      console.log(message);  
      sendMessages(message);
  };

  // LIFFの初期化
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
  