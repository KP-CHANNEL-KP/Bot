// Telegram API ကို ခေါ်ဆိုရန် Function
async function callTelegramApi(method, body, env) {
	const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`; 
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

// 1. New Member ဝင်လာတဲ့အခါ လုပ်ဆောင်မယ့် Function (Welcome Bot)
async function onNewChatMember(chatId, newMembers, env) {
    // ဝင်လာတဲ့ Member အားလုံးအတွက် နာမည်တွေကို စုစည်းမယ်
    const memberNames = newMembers.map(member => {
        return member.first_name || "အဖွဲ့ဝင်အသစ်"; 
    }).join(', ');
    
    // Welcome စာသား ဖန်တီးခြင်း
    const welcomeMessage = `Group ထဲကို ကြိုဆိုပါတယ်ရှင်၊ ${memberNames}! Group ရဲ့ စည်းကမ်းတွေကို ဖတ်ပေးဖို့ မေတ္တာရပ်ခံပါတယ်။`;

    await callTelegramApi('sendMessage', {
        chat_id: chatId,
        text: welcomeMessage,
    }, env);

    return new Response('OK');
}

// 2. ပုံမှန် Message တွေကို ကိုင်တွယ်တဲ့ Function (Auto Replay Logic)
async function onMessage(message, env) {
    const chatId = message.chat.id;
    // စာလုံးအကြီး/အသေး ဂရုမစိုက်ရအောင် ပြောင်းထားသည်
    const text = message.text ? message.text.toLowerCase() : ''; 
    
    let responseText = "";

    // >>> Auto Replay Logic (သင်၏ မေးခွန်း/အဖြေများ) <<<
    
    if (text.includes("ဈေးနှုန်း") || text.includes("ဘယ်လောက်လဲ")) { 
        responseText = "လက်ရှိ ဝန်ဆောင်မှု ဈေးနှုန်းများမှာ ၁၀၀၀ ကျပ် မှ ၅၀၀၀ ကျပ် အတွင်းရှိပါသည်။";
    } 
    else if (text.includes("လိပ်စာ") || text.includes("ဆိုင်")) 
	// 3. Admin Command များကို ကိုင်တွယ်ရန် Function (Kick, Ban, Mute)
async function onAdminCommand(message, env) {
    const chatId = message.chat.id;
    const text = message.text ? message.text.toLowerCase() : '';
    const senderId = message.from.id;

    // Command ကို စစ်ဆေးရန် (ဥပမာ: /kick)
    if (text.startsWith('/kick') || text.startsWith('/ban')) {
        // Admin ဟုတ် မဟုတ် အရင်စစ်ဆေးရန် (ပိုမိုရှုပ်ထွေးသော စစ်ဆေးမှု လိုအပ်နိုင်သည်)

        // Reply လုပ်ထားတဲ့ Message ရှိမှသာ ကန်ထုတ်ခြင်း/ပိတ်ဆို့ခြင်း လုပ်ဆောင်ရန်
        if (message.reply_to_message) {
            const targetUserId = message.reply_to_message.from.id;
            const targetUserName = message.reply_to_message.from.first_name;

            let method;
            if (text.startsWith('/kick')) {
                method = 'kickChatMember'; // Telegram မှာ အမှန်တကယ် 'unban' ကိုခေါ်ရ
                // Kick အတွက်၊ kickChatMember ခေါ်ပြီးနောက် restrictChatMember (permissions ဖြုတ်) ခေါ်ရသည်
                await callTelegramApi('kickChatMember', {
                    chat_id: chatId,
                    user_id: targetUserId,
                    until_date: Math.floor(Date.now() / 1000) + 60 // 1 မိနစ် ပိတ်ဆို့ပြီး ပြန်ဖွင့်
                }, env);
                return callTelegramApi('sendMessage', {
                    chat_id: chatId,
                    text: `${targetUserName} ကို Group မှ ကန်ထုတ်လိုက်ပါသည်။`
                }, env);

            } else if (text.startsWith('/ban')) {
                method = 'kickChatMember'; // Ban အတွက် permanent kick
                await callTelegramApi('kickChatMember', {
                    chat_id: chatId,
                    user_id: targetUserId,
                }, env);
                return callTelegramApi('sendMessage', {
                    chat_id: chatId,
                    text: `${targetUserName} ကို Group မှ အပြီးတိုင် ပိတ်ဆို့လိုက်ပါသည်။`
                }, env);
            }
        } else {
            return callTelegramApi('sendMessage', {
                chat_id: chatId,
                text: "ကန်ထုတ်ချင်သောသူ၏ စာကို Reply လုပ်ပြီး /kick (သို့မဟုတ်) /ban ကို ရိုက်ထည့်ပါ။"
            }, env);
        }
    }
    return new Response('OK');
}
