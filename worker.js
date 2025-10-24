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
    const text = message.text ? message.text.toLowerCase() : ''; 
    
    let responseText = "";

    // >>> ဤနေရာတွင် Auto Replay Logic ကို စတင်ရေးပါ (သင်၏ မေးခွန်း/အဖြေများ) <<<
    
    // 1. FAQ (မေးလေ့ရှိသော မေးခွန်းများ)
    if (text.includes("ဈေးနှုန်း") || text.includes("ဘယ်လောက်လဲ")) { 
        responseText = "လက်ရှိ ဝန်ဆောင်မှု ဈေးနှုန်းများမှာ ၁၀၀၀ ကျပ် မှ ၅၀၀၀ ကျပ် အတွင်းရှိပါသည်။";
    } 
    else if (text.includes("လိပ်စာ") || text.includes("ဆိုင်")) {
        responseText = "ကျွန်တော်တို့ရဲ့ ဆိုင်လိပ်စာကတော့ ရန်ကုန်၊ မင်္ဂလာတောင်ညွန့်မြို့နယ်မှာ တည်ရှိပါတယ်။";
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
        responseText = "မင်္ဂလာပါရှင်! ကျွန်မကတော့ အလိုအလျောက် ပြန်ဖြေပေးတဲ့ Bot ဖြစ်ပါတယ်။"; 
    }
    // 4. အခြားသော စာများအတွက် Default ပြန်ဖြေခြင်း
    else {
        responseText = "ကျွန်တော် နားမလည်သေးပါဘူး။ ကျေးဇူးပြုပြီး မေးခွန်းအပြည့်အစုံကို ရိုက်ထည့်ပေးပါ (သို့မဟုတ်) `/start` ကို ပို့ပါ။"; 
    }
    
    // >>> Auto Replay Logic ပြီးဆုံးခြင်း <<<
    
    await callTelegramApi('sendMessage', {
        chat_id: chatId,
        text: responseText,
    }, env);

    return new Response('OK');
}

// 3. Webhook ကို ကိုင်တွယ်ဖြေရှင်းမယ့် Listener (GitHub Deploy အတွက် အရေးကြီးဆုံး)
export default {
	async fetch(request, env) {
		const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
		if (secret !== env.BOT_SECRET) {
			return new Response('Unauthorized', { status: 401 });
		}
		
		if (request.method === 'POST') {
			try {
				const update = await request.json();
                
                // အဖွဲ့ဝင်အသစ် ဝင်ရောက်ခြင်းကို စစ်ဆေးသည်
				if (update.message) {
                    if (update.message.new_chat_members) {
                        const chatId = update.message.chat.id;
                        const newMembers = update.message.new_chat_members;
                        return onNewChatMember(chatId, newMembers, env);
                    } else if (update.message.text) {
                        // ပုံမှန်စာသား မက်ဆေ့ချ်ကို ကိုင်တွယ်သည် (Auto Replay Logic)
                        return onMessage(update.message, env);
                    }
				}
                
				return new Response('OK');
			} catch (e) {
				return new Response('Bad Request', { status: 400 });
			}
		}
		
		return new Response('Hello from Telegram Bot Worker', { status: 200 });
	},
};
