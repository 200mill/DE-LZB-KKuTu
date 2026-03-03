/**
 * Rule the words! DE LZB KKuTu
 * You can see this file in <https://github.com/minjun1177/DE-LZB-KKuTu>
 */

var JLog = require('./jjlog');
var GLOBAL = require('./global.json');
const { WebhookClient, EmbedBuilder } = require('discord.js');
let UseDiscordWebhook = GLOBAL.USE_DISCORD_WEBHOOK && GLOBAL.DISCORD_WEBHOOK_URL && GLOBAL.DISCORD_WEBHOOK_URL.startsWith("https://discord.com/api/webhooks/");

exports.SendWebhookOnTalk = function(profile, msg, place, isrobot) {
    var prefix = isrobot ? (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "[Robot]" : "[로봇]") : "";
    var nickname = (profile && (profile.nickname || profile.title || profile.name || profile.id)) || "Unknown";
    
    nickname = String(nickname).slice(0, 100); // 닉네임은 100자로 제한
    var placeText = String(place == null ? "-" : place).slice(0, 100);
    var msgText = String(msg == null ? "" : msg);

    if(msgText.length > 1020) msgText = msgText.slice(0, 1017) + "...";

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle( GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? `${prefix ? prefix + " " : ""}${nickname} send a chat.`.slice(0,256) :`${prefix ? prefix + " " : ""}${nickname}님이 채팅을 입력하셨습니다.`.slice(0, 256))
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Place" : "장소", value: placeText },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Message" : "내용", value: `\`\`\`${msgText || "(empty)"}\`\`\`` }
        )
        .setColor(0xF1C40F)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
		avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnDeleteRoom = function(roomid) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room Deleted" : "방 삭제됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") }
        )
        .setColor(0xE74C3C)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
// exports.SendWebhookOnTestingEvent = function(eventType, payload) {
//     if (!UseDiscordWebhook) return;
//     var eventText = String(eventType == null ? "unknown" : eventType);
//     var payloadText;

//     try{
//         payloadText = JSON.stringify(payload == null ? {} : payload);
//     }catch(e){
//         payloadText = String(payload);
//     }
//     if(payloadText.length > 1024) payloadText = payloadText.slice(0, 1021) + "...";

//     const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
//     const embed = new EmbedBuilder()
//         .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? `Testing Event: ${eventText}` : `테스트 이벤트: ${eventText}`)
//         .addFields(
//             { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Event" : "이벤트", value: eventText },
//             { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Payload" : "데이터", value: `\`\`\`${payloadText || "{}"}\`\`\`` }
//         )
//         .setColor(0x3498DB)
//         .setTimestamp();

//     webhookClient.send({
//         username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
//         avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
//         embeds: [embed],
//     }).catch(function(error){
//         JLog.error(`Error on sending Discord webhook: ${error}`);
//     });
// }
exports.SendWebhookOnRoomsetting = function(roomid, passwd, mode, opts) { // TODO - modify에 JSON정보 확인안됨 - 해결
    if (!UseDiscordWebhook) return;

    // 필드 값 길이 제한 (Discord embed field max 1024 chars)
    var roomidText = String(roomid || "").slice(0, 1020);
    var passwdText = String(passwd || "").slice(0, 1020);
    var modeText = String(mode || "").slice(0, 1020);
    var optsText = "";
    
    if (opts) {
        try {
            optsText = JSON.stringify(opts);
            if (optsText.length > 1020) optsText = optsText.slice(0, 1017) + "...";
        } catch(e) {
            optsText = "[Invalid Options]";
        }
    }

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room Setting Changed" : "방 설정 변경됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Password" : "비밀번호", value: passwdText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Mode" : "모드", value: modeText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Options" : "옵션", value: optsText ? `\`\`\`${optsText}\`\`\`` : (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") }
        )
        .setColor(0x2ECC71)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnRoomJoin = function(roomid, targetid, passwd) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);
    var targetidText = String(targetid || "").slice(0, 1020);
    var passwdText = String(passwd || "").slice(0, 1020);

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room Joined" : "방 입장됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Target ID" : "대상 ID", value: targetidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Password" : "비밀번호", value: passwdText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") }
        )
        .setColor(0x9B59B6)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnGameStart = function(roomid, round, mode) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);
    var modeText = String(mode || "").slice(0, 1020);

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Game Started" : "게임 시작됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Round" : "라운드", value: String(round + 1) },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Mode" : "모드", value: `\`\`\`${modeText || "unknown"}\`\`\`` }
        )
        .setColor(0x1ABC9C)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnGameEnd = function(roomid, resultCount, userCount) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);
    var resultCountText = String(resultCount || "").slice(0, 1020);

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Game Ended" : "게임 종료됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Result Count" : "결과", value: resultCountText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "User Count" : "유저 수", value: String(userCount) }
        )
        .setColor(0x34495E)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnRoundEnd = function(roomid, round) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Round Ended" : "라운드 종료됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Round" : "라운드", value: String(round) }
        )
        .setColor(0x8E44AD)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
exports.SendWebhookOnRoomLeave = function(roomid, targetid, removed) {
    if (!UseDiscordWebhook) return;
    
    var roomidText = String(roomid || "").slice(0, 1020);
    var targetidText = String(targetid || "").slice(0, 1020);
    var removedText = removed ? (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Yes" : "예") : (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "No" : "아니오");

    const webhookClient = new WebhookClient({ url: GLOBAL.DISCORD_WEBHOOK_URL });
    const embed = new EmbedBuilder()
        .setTitle(GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room Left" : "방 퇴장됨")
        .addFields(
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Room ID" : "방 ID", value: roomidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Target ID" : "대상 ID", value: targetidText || (GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "None" : "없음") },
            { name: GLOBAL.IS_DISCORD_WEBHOOK_ENGLISH ? "Removed" : "방 제거됨", value: removedText }
        )
        .setColor(0xE67E22)
        .setTimestamp();

    webhookClient.send({
        username: GLOBAL.DISCORD_WEBHOOK_NICKNAME || 'KKuTu Alert',
        avatarURL: GLOBAL.DISCORD_AVATAR || 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    }).catch(function(error){
        JLog.error(`Error on sending Discord webhook: ${error}`);
    });
}
