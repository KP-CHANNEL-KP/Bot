// ... (callTelegramApi function ကို မပြောင်းလဲဘဲ ထားပါ)
// ... (onNewChatMember function ကို မပြောင်းလဲဘဲ ထားပါ)


// 2. ပုံမှန် Message တွေကို ကိုင်တွယ်တဲ့ Function (Auto Replay Logic)
async function onMessage(message, env) {
    const chatId = message.chat.id;
    const text = message.text ? message.text.toLowerCase() : ''; // စာလုံးအကြီး/အသေး ဂရုမစိုက်ရအောင် ပြောင်းထားသည်
    
    let responseText = "";

    // >>> ဤနေရာတွင် Auto Replay Logic ကို စတင်ရေးပါ <<<
    
    // 1. FAQ (မေးလေ့ရှိသော မေးခွန်းများ)
    if (text.includes("ဈေးနှုန်း") || text.includes("ဘယ်လောက်လဲ")) { 
        responseText = "လက်ရှိ ဝန်ဆောင်မှု ဈေးနှုန်းများမှာ ၁၀၀၀ ကျပ် မှ ၅၀၀၀ ကျပ် အတွင်းရှိပါသည်။ အသေးစိတ်ကို `/price` ဖြင့် ကြည့်နိုင်ပါတယ်။";
    } 
    else if (text.includes("လိပ်စာ") || text.includes("ဆိုင်")) {
        responseText = "ကျွန်တော်တို့ရဲ့ ဆိုင်လိပ်စာကတော့ ရန်ကုန်၊ မင်္ဂလာတောင်ညွန့်မြို့နယ်မှာ တည်ရှိပါတယ်။ မြေပုံလင့်ခ် ပို့ပေးလိုက်ပါတယ်။";
    }
    else if (text.includes("ဆက်သွယ်")) {
        responseText = "ဖုန်းနံပါတ်: 09-xxxxxxx (သို့မဟုတ်) Email: example@email.com ကို ဆက်သွယ်နိုင်ပါတယ်။";
    }
    // 2. နှုတ်ဆက်ခြင်း/အမေးအဖြေ ကိုင်တွယ်ခြင်း
    else if (text.includes("နေကောင်းလား")) { 
        responseText = "ကျန်းမာပါတယ်ခင်ဗျား။ သင်ရော နေကောင်းရဲ့လား။";
    } 
    // 3. Command များကို ကိုင်တွယ်ခြင်း
    else if (text === '/start') {
        responseText = "မင်္ဂလာပါရှင်! ကျွန်မကတော့ အလိုအလျောက် ပြန်ဖြေပေးတဲ့ Bot ဖြစ်ပါတယ်။ ကျေးဇူးပြုပြီး သင့်မေးခွန်းကို ရိုက်ထည့်ပေးပါ။"; 
    }
    // 4. အခြားသော စာများအတွက် Default ပြန်ဖြေခြင်း (Echo Logic ကို ဖယ်လိုက်ပါ)
    else {
        responseText = "ကျွန်တော် နားမလည်သေးပါဘူး။ ကျေးဇူးပြုပြီး မေးခွန်းအပြည့်အစုံကို ရိုက်ထည့်ပေးပါ (သို့မဟုတ်) `/help` ကို ပို့ပါ။"; 
    }
    
    // >>> Auto Replay Logic ပြီးဆုံးခြင်း <<<
    
    await callTelegramApi('sendMessage', {
        chat_id: chatId,
        text: responseText,
    }, env);

    return new Response('OK');
}

// ... (export default fetch အောက်က Logic ကို မပြောင်းလဲဘဲ ထားပါ)
